// Spilplatte engine. Plain ES2017 so it runs in iOS 12 Safari.
// A game defines setup(), update(dt) and draw(), plus optional onTap(x, y),
// onDrag(x, y) and onRelease(x, y). Coordinates are always 1024 x 768.
(function () {
  var WIDTH = 1024;
  var HEIGHT = 768;
  // Performance budget: the slowest target is the original iPad Air (A7, 1 GB RAM).
  // The canvas renders at 1x pixels and emoji/text are drawn once into cached bitmaps.
  var PIXEL_RATIO = 1;
  var MAX_CACHED_GLYPHS = 300;
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d", { alpha: false });
  var glyphs = {};
  var glyphCount = 0;
  var images = {};
  var sounds = {};
  var audio = null;
  var started = false;
  var scale = 1;

  window.WIDTH = WIDTH;
  window.HEIGHT = HEIGHT;
  window.ctx = ctx;

  // iOS 12 reports the old size for a moment after rotating, so measure the viewport again a
  // few times after every resize or orientation change.
  function viewportWidth() { return document.documentElement.clientWidth || window.innerWidth; }
  function viewportHeight() { return document.documentElement.clientHeight || window.innerHeight; }

  function scheduleResize() {
    resize();
    setTimeout(resize, 100);
    setTimeout(resize, 400);
    setTimeout(resize, 1000);
  }

  // A game can opt in to two extras by setting these at the top of game.js:
  // - window.HI_RES = true: render at the screen's real pixel density (sharp on phones and
  //   Retina iPads). Only for light games; it costs the old iPad Air up to 4x the pixels.
  // - window.ADAPTIVE = true: the world keeps a short side of 768 and stretches its long side
  //   to the screen, in portrait or landscape. WIDTH/HEIGHT change on rotation, and the
  //   game's onLayout() is called so it can place things again.
  var glyphScale = 1;

  // The canvas stays inside the safe area (notch, home indicator, rounded corners).
  var safeProbe = null;

  function safeInsets() {
    if (!safeProbe) {
      safeProbe = document.createElement("div");
      safeProbe.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;visibility:hidden;" +
        "padding-top:env(safe-area-inset-top);padding-right:env(safe-area-inset-right);" +
        "padding-bottom:env(safe-area-inset-bottom);padding-left:env(safe-area-inset-left);";
      document.body.appendChild(safeProbe);
    }
    var style = getComputedStyle(safeProbe);
    return {
      top: parseFloat(style.paddingTop) || 0, right: parseFloat(style.paddingRight) || 0,
      bottom: parseFloat(style.paddingBottom) || 0, left: parseFloat(style.paddingLeft) || 0
    };
  }

  window.RESERVED = { w: 0, h: 0 };

  function resize() {
    var insets = safeInsets();
    var width = viewportWidth() - insets.left - insets.right;
    var height = viewportHeight() - insets.top - insets.bottom;
    window.scrollTo(0, 0);
    if (window.ADAPTIVE) {
      if (height > width) { WIDTH = 768; HEIGHT = Math.max(1024, Math.round(768 * height / width)); }
      else { HEIGHT = 768; WIDTH = Math.max(1024, Math.round(768 * width / height)); }
      window.WIDTH = WIDTH;
      window.HEIGHT = HEIGHT;
    }
    var ratio = window.HI_RES ? Math.min(window.devicePixelRatio || 1, 3) : PIXEL_RATIO;
    scale = Math.min(width / WIDTH, height / HEIGHT);
    var canvasLeft = insets.left + (width - WIDTH * scale) / 2;
    var canvasTop = insets.top + (height - HEIGHT * scale) / 2;
    // The 🏠 ↺ 👤 buttons cover this much of the world's top-left corner.
    window.RESERVED = {
      w: Math.max(0, (insets.left + 236 - canvasLeft) / scale),
      h: Math.max(0, (insets.top + 84 - canvasTop) / scale)
    };
    if (window.ADAPTIVE) call("onLayout");
    var newGlyphScale = window.HI_RES ? scale * ratio : 1;
    if (newGlyphScale !== glyphScale) { glyphScale = newGlyphScale; glyphs = {}; glyphCount = 0; }
    canvas.style.width = WIDTH * scale + "px";
    canvas.style.height = HEIGHT * scale + "px";
    canvas.style.left = canvasLeft + "px";
    canvas.style.top = canvasTop + "px";
    canvas.width = WIDTH * scale * ratio;
    canvas.height = HEIGHT * scale * ratio;
    ctx.setTransform(scale * ratio, 0, 0, scale * ratio, 0, 0);
  }

  function toGame(touch) {
    var rect = canvas.getBoundingClientRect();
    return { x: (touch.clientX - rect.left) / scale, y: (touch.clientY - rect.top) / scale };
  }

  function call(name, a, b) {
    if (typeof window[name] === "function") window[name](a, b);
  }

  function start() {
    if (started) return;
    started = true;
    window.startAudio();
    call("setup");
  }

  function handle(event, name) {
    event.preventDefault();
    if (!started) { if (name === "onTap") start(); return; }
    for (var i = 0; i < event.changedTouches.length; i++) {
      var p = toGame(event.changedTouches[i]);
      call(name, p.x, p.y);
    }
  }

  canvas.addEventListener("touchstart", function (e) { handle(e, "onTap"); });
  canvas.addEventListener("touchmove", function (e) { handle(e, "onDrag"); });
  canvas.addEventListener("touchend", function (e) { handle(e, "onRelease"); });
  canvas.addEventListener("mousedown", function (e) { handle({ preventDefault: function () {}, changedTouches: [e] }, "onTap"); });
  var mouseIsDown = false;
  canvas.addEventListener("mousedown", function () { mouseIsDown = true; });
  window.addEventListener("mouseup", function () { mouseIsDown = false; });
  canvas.addEventListener("mousemove", function (e) { if (mouseIsDown) handle({ preventDefault: function () {}, changedTouches: [e] }, "onDrag"); });
  canvas.addEventListener("mouseup", function (e) { handle({ preventDefault: function () {}, changedTouches: [e] }, "onRelease"); });
  document.addEventListener("touchmove", function (e) { e.preventDefault(); }, { passive: false });
  document.addEventListener("gesturestart", function (e) { e.preventDefault(); });

  // ---- Helpers the games use ----

  window.clear = function (color) {
    ctx.fillStyle = color || "#000";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  };

  window.circle = function (x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  };

  window.box = function (x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
  };

  // Fun fonts a game can pick with useFont("<name>") at the top of game.js. "arcade" is
  // bundled (shared/fonts); the others are built into iOS 12.
  var FONTS = {
    standard: { weight: "bold", family: "-apple-system, Helvetica, sans-serif" },
    arcade: { weight: "normal", family: "\"Press Start 2P\", monospace" },
    kridt: { weight: "bold", family: "\"Chalkboard SE\", \"Comic Sans MS\", sans-serif" },
    tusch: { weight: "normal", family: "\"MarkerFelt-Wide\", \"Marker Felt\", sans-serif" },
    racer: { weight: "normal", family: "\"Futura-CondensedExtraBold\", Futura, Impact, sans-serif" },
    rund: { weight: "normal", family: "\"Arial Rounded MT Bold\", \"Helvetica Rounded\", sans-serif" }
  };
  var currentFont = FONTS.standard;
  window.useFont = function (name) {
    currentFont = FONTS[name] || FONTS.standard;
    glyphs = {}; glyphCount = 0;
  };
  window.fontFor = function (size) {
    return currentFont.weight + " " + size + "px " + currentFont.family;
  };
  if (document.fonts && document.fonts.load) {
    document.fonts.load("16px \"Press Start 2P\"").then(function () { glyphs = {}; glyphCount = 0; }).catch(function () {});
  }

  function glyph(words, size, color) {
    var key = size + "|" + color + "|" + words;
    var cached = glyphs[key];
    if (cached) return cached;
    if (glyphCount >= (glyphScale > 1.5 ? MAX_CACHED_GLYPHS / 2 : MAX_CACHED_GLYPHS)) { glyphs = {}; glyphCount = 0; }
    var pixels = Math.round(size * glyphScale);
    var font = window.fontFor(pixels);
    var c = document.createElement("canvas");
    var g = c.getContext("2d");
    g.font = font;
    c.width = Math.ceil(g.measureText(words).width + pixels * 0.4);
    c.height = Math.ceil(pixels * 1.4);
    g.font = font;
    g.fillStyle = color;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(words, c.width / 2, c.height / 2);
    glyphs[key] = c;
    glyphCount++;
    return c;
  }

  window.text = function (words, x, y, size, color) {
    var c = glyph(String(words), Math.round(size || 40), color || "#fff");
    if (glyphScale === 1) { ctx.drawImage(c, Math.round(x - c.width / 2), Math.round(y - c.height / 2)); return; }
    var w = c.width / glyphScale;
    var h = c.height / glyphScale;
    ctx.drawImage(c, x - w / 2, y - h / 2, w, h);
  };

  window.emoji = function (symbol, x, y, size) {
    window.text(symbol, x, y, size || 80);
  };

  window.picture = function (file, x, y, width, height) {
    var img = images[file];
    if (!img) { img = images[file] = new Image(); img.src = file; }
    if (img.complete && img.naturalWidth) {
      var w = width || img.naturalWidth;
      var h = height || img.naturalHeight;
      ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
    }
  };

  window.beep = function (pitch, seconds) {
    if (!audio) return;
    var osc = audio.createOscillator();
    var gain = audio.createGain();
    osc.frequency.value = pitch || 440;
    gain.gain.setValueAtTime(0.3, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + (seconds || 0.2));
    osc.connect(gain); gain.connect(audio.destination);
    osc.start(); osc.stop(audio.currentTime + (seconds || 0.2));
  };

  // Ready-made sound effects, synthesized so they cost no downloads. Preview them on
  // shared/lyde.html. Usage: sfx("pop").
  var SFX = {
    pop:        [{ wave: "square",   from: 900, to: 300,  time: 0.08 }],
    hop:        [{ wave: "square",   from: 300, to: 800,  time: 0.15 }],
    mont:       [{ wave: "square",   from: 990, to: 990,  time: 0.06 }, { wave: "square", from: 1320, to: 1320, time: 0.2, delay: 0.06 }],
    laser:      [{ wave: "sawtooth", from: 1500, to: 200, time: 0.2 }],
    bump:       [{ wave: "triangle", from: 150, to: 60,   time: 0.15 }],
    boing:      [{ wave: "sine",     from: 200, to: 600,  time: 0.3, wobble: 12 }],
    eksplosion: [{ wave: "noise",    time: 0.6 }],
    klik:       [{ wave: "square",   from: 1200, to: 1200, time: 0.03 }],
    hammer:     [{ wave: "triangle", from: 180, to: 70, time: 0.07 }, { wave: "noise", time: 0.04 }, { wave: "triangle", from: 180, to: 70, time: 0.07, delay: 0.2 }, { wave: "noise", time: 0.04, delay: 0.2 }, { wave: "triangle", from: 180, to: 70, time: 0.07, delay: 0.4 }, { wave: "noise", time: 0.04, delay: 0.4 }],
    sav:        [{ wave: "sawtooth", from: 220, to: 330, time: 0.16 }, { wave: "sawtooth", from: 330, to: 220, time: 0.16, delay: 0.17 }, { wave: "sawtooth", from: 220, to: 330, time: 0.16, delay: 0.34 }, { wave: "sawtooth", from: 330, to: 220, time: 0.16, delay: 0.51 }],
    sejr:       [{ wave: "square", from: 523, to: 523, time: 0.12 }, { wave: "square", from: 659, to: 659, time: 0.12, delay: 0.12 }, { wave: "square", from: 784, to: 784, time: 0.12, delay: 0.24 }, { wave: "square", from: 1046, to: 1046, time: 0.35, delay: 0.36 }],
    tab:        [{ wave: "triangle", from: 400, to: 380, time: 0.25 }, { wave: "triangle", from: 300, to: 280, time: 0.25, delay: 0.25 }, { wave: "triangle", from: 200, to: 120, time: 0.5, delay: 0.5 }]
  };
  var noiseBuffer = null;

  function tone(part) {
    var t = audio.currentTime + (part.delay || 0);
    var gain = audio.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + part.time);
    gain.connect(audio.destination);
    var source;
    if (part.wave === "noise") {
      if (!noiseBuffer) {
        noiseBuffer = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
        var data = noiseBuffer.getChannelData(0);
        for (var i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      }
      source = audio.createBufferSource();
      source.buffer = noiseBuffer;
    } else {
      source = audio.createOscillator();
      source.type = part.wave;
      source.frequency.setValueAtTime(part.from, t);
      source.frequency.exponentialRampToValueAtTime(part.to, t + part.time);
      if (part.wobble) {
        var lfo = audio.createOscillator();
        var depth = audio.createGain();
        lfo.frequency.value = part.wobble;
        depth.gain.value = 40;
        lfo.connect(depth); depth.connect(source.frequency);
        lfo.start(t); lfo.stop(t + part.time);
      }
    }
    source.connect(gain);
    source.start(t);
    source.stop(t + part.time);
  }

  window.startAudio = function () {
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!audio && AudioContext) audio = new AudioContext();
  };

  window.sfx = function (name) {
    if (!audio || !SFX[name]) return;
    SFX[name].forEach(tone);
  };
  window.SFX_NAMES = Object.keys(SFX);

  window.sound = function (file) {
    if (!audio) return;
    var cached = sounds[file];
    function play(buffer) {
      var src = audio.createBufferSource();
      src.buffer = buffer; src.connect(audio.destination); src.start(0);
    }
    if (cached) { play(cached); return; }
    var xhr = new XMLHttpRequest();
    xhr.open("GET", file); xhr.responseType = "arraybuffer";
    xhr.onload = function () {
      audio.decodeAudioData(xhr.response, function (buffer) { sounds[file] = buffer; play(buffer); });
    };
    xhr.send();
  };

  window.random = function (min, max) { return min + Math.random() * (max - min); };
  window.distance = function (x1, y1, x2, y2) { return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)); };

  window.save = function (key, value) {
    try { localStorage.setItem(location.pathname + key, JSON.stringify(value)); } catch (e) {}
  };
  window.load = function (key, fallback) {
    try { var v = localStorage.getItem(location.pathname + key); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
  };

  // ---- Start over ----
  // Every game gets a ↺ button that wipes its saved progress (everything stored with save())
  // after the kid confirms, then restarts the game.

  function addStartOver() {
    var button = document.createElement("a");
    button.className = "home restart";
    button.href = "#";
    button.textContent = "↺";
    button.style.left = "calc(88px + env(safe-area-inset-left))";
    var dialog = document.createElement("div");
    dialog.className = "confirm";
    dialog.innerHTML = '<div class="confirm-box"><p class="confirm-title">Vil du starte forfra?</p>' +
      '<p class="confirm-text">' + (window.USES_PLAYERS ? "Dine point og din rekord i dette spil bliver slettet." : "Alt i spillet bliver slettet: point, rekorder og det du har bygget.") + '</p>' +
      '<button class="confirm-yes">🗑️ Ja, start forfra</button>' +
      '<button class="confirm-no">Nej, spil videre</button></div>';
    function press(element, action) {
      element.addEventListener("touchend", function (event) { event.preventDefault(); action(); });
      element.addEventListener("click", function (event) { event.preventDefault(); action(); });
    }
    press(button, function () { dialog.style.display = "flex"; });
    press(dialog.querySelector(".confirm-no"), function () { dialog.style.display = "none"; });
    press(dialog.querySelector(".confirm-yes"), function () {
      try {
        for (var i = localStorage.length - 1; i >= 0; i--) {
          var key = localStorage.key(i);
          var mine = !window.USES_PLAYERS || key.slice(-(window.player().id.length + 1)) === "@" + window.player().id;
          if (key && key.indexOf(location.pathname) === 0 && mine) localStorage.removeItem(key);
        }
      } catch (e) {}
      location.replace(location.pathname + "?v=" + Date.now());
    });
    document.body.appendChild(button);
    document.body.appendChild(dialog);
  }

  // ---- Players ----
  // A game that sets window.USES_PLAYERS = true asks "Hvem spiller?" when it opens. Players are
  // kept only in this iPad's storage (never in the repo) and shared by every game. Games store
  // per-player data with playerSave/playerLoad and show everyone's best with showRecords(key).

  var PLAYERS_KEY = "spilplatte-players";
  var CURRENT_KEY = "spilplatte-player";
  var GUEST = { id: "gaest", name: "Gæst", emoji: "🙂" };
  var AVATARS = ["🦊", "🐼", "🦄", "🐯", "🐸", "🐙", "🦖", "🐵"];
  var current = GUEST;

  function readPlayers() {
    try { return JSON.parse(localStorage.getItem(PLAYERS_KEY)) || []; } catch (e) { return []; }
  }

  function writePlayers(list) {
    try { localStorage.setItem(PLAYERS_KEY, JSON.stringify(list)); } catch (e) {}
  }

  function rememberCurrent(player) {
    current = player;
    try { localStorage.setItem(CURRENT_KEY, player.id); } catch (e) {}
  }

  window.player = function () { return current; };
  window.playerSave = function (key, value) { window.save(key + "@" + current.id, value); };
  window.playerLoad = function (key, fallback) { return window.load(key + "@" + current.id, fallback); };

  function el(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function onPress(node, action) {
    node.addEventListener("touchend", function (event) { event.preventDefault(); action(); });
    node.addEventListener("click", function (event) { event.preventDefault(); action(); });
  }

  var overlay = null;

  function closeOverlay() {
    if (overlay) { document.body.removeChild(overlay); overlay = null; }
  }

  function openOverlay(title) {
    closeOverlay();
    overlay = el("div", "confirm people");
    overlay.style.display = "flex";
    var panel = el("div", "confirm-box people-box");
    panel.appendChild(el("p", "confirm-title", title));
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    return panel;
  }

  function pick(player) {
    var changed = current.id !== player.id;
    rememberCurrent(player);
    closeOverlay();
    playerButton.textContent = player.emoji;
    if (!started) start();
    else if (changed) location.replace(location.pathname + "?v=" + Date.now());
  }

  window.choosePlayer = function () {
    var panel = openOverlay("Hvem spiller? 🎮");
    var grid = el("div", "people-grid");
    readPlayers().concat([GUEST]).forEach(function (player) {
      var button = el("button", "person" + (player.id === current.id ? " person-current" : ""), '<span class="person-emoji">' + player.emoji + "</span>" + escapeHtml(player.name));
      onPress(button, function () { pick(player); });
      grid.appendChild(button);
    });
    var add = el("button", "person person-new", '<span class="person-emoji">➕</span>Ny spiller');
    onPress(add, newPlayerForm);
    grid.appendChild(add);
    panel.appendChild(grid);
  };

  function escapeHtml(text) {
    return String(text).replace(/[&<>"]/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]; });
  }

  function newPlayerForm() {
    var panel = openOverlay("Ny spiller ✨");
    var input = el("input", "person-input");
    input.type = "text";
    input.maxLength = 12;
    input.placeholder = "Dit navn";
    panel.appendChild(input);
    var chosen = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    var row = el("div", "avatar-row");
    AVATARS.forEach(function (avatar) {
      var button = el("button", "avatar" + (avatar === chosen ? " avatar-chosen" : ""), avatar);
      onPress(button, function () {
        chosen = avatar;
        Array.prototype.forEach.call(row.children, function (child) { child.className = "avatar" + (child.textContent === avatar ? " avatar-chosen" : ""); });
      });
      row.appendChild(button);
    });
    panel.appendChild(row);
    var message = el("p", "person-message", "");
    var saveButton = el("button", "confirm-no", "✔ Gem");
    onPress(saveButton, function () {
      var name = input.value.trim();
      if (!name) { message.textContent = "Skriv dit navn først"; return; }
      var player = { id: "p" + Date.now(), name: name, emoji: chosen };
      writePlayers(readPlayers().concat([player]));
      pick(player);
    });
    panel.appendChild(saveButton);
    var back = el("button", "confirm-yes", "Tilbage");
    onPress(back, window.choosePlayer);
    panel.appendChild(back);
    panel.appendChild(message);
    input.focus();
  }

  window.showRecords = function (key, unit) {
    var panel = openOverlay("🏆 Rekorder");
    var rows = readPlayers().concat([GUEST]).map(function (player) {
      var value = 0;
      try { value = JSON.parse(localStorage.getItem(location.pathname + key + "@" + player.id)) || 0; } catch (e) {}
      return { player: player, value: value };
    }).sort(function (a, b) { return b.value - a.value; });
    var list = el("div", "records");
    rows.forEach(function (row, i) {
      var medal = ["🥇", "🥈", "🥉"][i] || "";
      list.appendChild(el("div", "record-row" + (row.player.id === current.id ? " record-me" : ""),
        "<span>" + medal + " " + row.player.emoji + " " + escapeHtml(row.player.name) + "</span><span>" + row.value + (unit || "") + "</span>"));
    });
    panel.appendChild(list);
    var close = el("button", "confirm-no", "Luk");
    onPress(close, closeOverlay);
    panel.appendChild(close);
  };

  var playerButton = null;

  function addPlayerButton() {
    var id = null;
    try { id = localStorage.getItem(CURRENT_KEY); } catch (e) {}
    readPlayers().forEach(function (player) { if (player.id === id) current = player; });
    playerButton = el("a", "home");
    playerButton.href = "#";
    playerButton.className = "home player-button";
    playerButton.textContent = current.emoji;
    onPress(playerButton, window.choosePlayer);
    document.body.appendChild(playerButton);
    window.choosePlayer();
  }

  // ---- Loop ----

  var last = 0;
  function frame(now) {
    var dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (started) {
      call("update", dt);
      call("draw");
    } else {
      window.clear("#1d1f33");
      window.text(document.title, WIDTH / 2, HEIGHT / 2 - 60, 72);
      window.text("👆 Tryk for at starte", WIDTH / 2, HEIGHT / 2 + 60, 44, "#ffd34e");
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener("load", function () {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("../../sw.js").catch(function () {});
    if (window.SOUND_PREVIEW) return;
    document.body.className = "game";
    var home = document.createElement("a");
    home.className = "home"; home.href = "../../?v=" + Date.now(); home.textContent = "🏠";
    home.addEventListener("click", function (event) {
      event.preventDefault();
      location.href = home.href;
    });
    document.body.appendChild(home);
    addStartOver();
    document.body.appendChild(canvas);
    if (window.USES_PLAYERS) addPlayerButton();
    resize();
    requestAnimationFrame(function (now) { last = now; frame(now); });
  });
  window.addEventListener("resize", scheduleResize);
  window.addEventListener("orientationchange", scheduleResize);
})();
