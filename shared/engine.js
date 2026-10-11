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

  function resize() {
    var ratio = PIXEL_RATIO;
    var width = viewportWidth();
    var height = viewportHeight();
    window.scrollTo(0, 0);
    scale = Math.min(width / WIDTH, height / HEIGHT);
    canvas.style.width = WIDTH * scale + "px";
    canvas.style.height = HEIGHT * scale + "px";
    canvas.style.left = (width - WIDTH * scale) / 2 + "px";
    canvas.style.top = (height - HEIGHT * scale) / 2 + "px";
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
    if (glyphCount >= MAX_CACHED_GLYPHS) { glyphs = {}; glyphCount = 0; }
    var font = window.fontFor(size);
    var c = document.createElement("canvas");
    var g = c.getContext("2d");
    g.font = font;
    c.width = Math.ceil(g.measureText(words).width + size * 0.4);
    c.height = Math.ceil(size * 1.4);
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
    ctx.drawImage(c, Math.round(x - c.width / 2), Math.round(y - c.height / 2));
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
    button.style.left = "88px";
    var dialog = document.createElement("div");
    dialog.className = "confirm";
    dialog.innerHTML = '<div class="confirm-box"><p class="confirm-title">Vil du starte forfra?</p>' +
      '<p class="confirm-text">Alt i spillet bliver slettet: point, rekorder og det du har bygget.</p>' +
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
          if (key && key.indexOf(location.pathname) === 0) localStorage.removeItem(key);
        }
      } catch (e) {}
      location.replace(location.pathname + "?v=" + Date.now());
    });
    document.body.appendChild(button);
    document.body.appendChild(dialog);
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
    resize();
    requestAnimationFrame(function (now) { last = now; frame(now); });
  });
  window.addEventListener("resize", scheduleResize);
  window.addEventListener("orientationchange", scheduleResize);
})();
