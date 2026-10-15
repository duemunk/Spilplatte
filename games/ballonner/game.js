useFont("rund");
window.HI_RES = true;
window.ADAPTIVE = true;
window.USES_PLAYERS = true;

var LIVES = 3;
var SLOW_SECONDS = 4;
var GOLD_POINTS = 5;
var POINTS_PER_LEVEL = 15;
var BALLOON_COLORS = ["#ff6b6b", "#4dabf7", "#51cf66", "#ffa94d", "#f06595", "#20c997", "#845ef7"];
var clouds = [];
var level = 1;
var PIECE_COLORS = ["#ff6b6b", "#ffd43b", "#ffffff", "#ff8787"];

var balloons = [];
var pieces = [];
var floaters = [];
var points = 0;
var best = 0;
var lives = LIVES;
var over = false;
var newRecord = false;
var slowTime = 0;

function setup() {
  best = playerLoad("best", 0);
  for (var i = 0; i < 6; i++) clouds.push({ x: random(0, 1600), y: random(140, 600), size: random(0.6, 1.2), speed: random(10, 30) });
}

function restart() {
  balloons = [];
  pieces = [];
  floaters = [];
  points = 0;
  lives = LIVES;
  over = false;
  newRecord = false;
  slowTime = 0;
  level = 1;
  stars = [];
}

// Every level brings something new; after the last unlock the game just keeps speeding up.
var UNLOCKS = {
  2: "Små hurtige balloner giver 2 point",
  3: "Guld-balloner ⭐ giver 5 point",
  4: "Pas på bomberne 💣",
  5: "Ur-balloner ⏰ gør alt langsomt",
  6: "Balloner der svæver i zigzag 🌬️",
  7: "Hjerte-balloner ❤️ giver et ekstra liv",
  8: "Regnbue-balloner 🌈 popper alle på én gang",
  9: "Ballon-klaser — tre på én snor 🎈🎈🎈"
};
var MAX_LIVES = 5;
var PATTERNS = ["plain", "plain", "stripes", "dots", "shine"];
var SKIES = [
  { sky: "#87ceeb", low: "#a5d8ff", sun: "#fff3bf" },
  { sky: "#ffd8a8", low: "#ffe8cc", sun: "#fff3bf" },
  { sky: "#ff8787", low: "#ffa94d", sun: "#ffec99" },
  { sky: "#5f3dc4", low: "#9775fa", sun: "#ffe066" },
  { sky: "#1c2a5c", low: "#364fc7", sun: "#f1f3f5", night: true },
  { sky: "#0b0b2a", low: "#1c1c4a", sun: "#f1f3f5", night: true }
];
var stars = [];

function balloonKind() {
  var roll = Math.random();
  if (level >= 8 && roll < 0.03) return "rainbow";
  if (level >= 7 && roll < 0.07) return "heart";
  if (level >= 4 && roll < 0.17) return "bomb";
  if (level >= 3 && roll < 0.25) return "gold";
  if (level >= 5 && roll < 0.3) return "clock";
  return "normal";
}

function shade(hex, factor) {
  var value = parseInt(hex.slice(1), 16);
  function part(shift) { return Math.max(0, Math.min(255, Math.round(((value >> shift) & 255) * factor))); }
  return "rgb(" + part(16) + "," + part(8) + "," + part(0) + ")";
}

function spawnBalloon(x, y, kind) {
  var small = level >= 2 && kind === "normal" && Math.random() < 0.3;
  var color = kind === "gold" ? "#fcc419" : kind === "clock" ? "#9775fa" : kind === "heart" ? "#ff4d6d" : BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
  balloons.push({
    x: x, y: y, kind: kind, small: small, color: color, dark: shade(color, 0.72), light: shade(color, 1.25),
    pattern: kind === "normal" ? PATTERNS[Math.floor(Math.random() * PATTERNS.length)] : "plain",
    zigzag: level >= 6 && Math.random() < 0.35, phase: random(0, 6.28), baseX: x,
    speed: (random(70, 160) + Math.min(level, 12) * 25) * (small ? 1.5 : 1)
  });
}

function loseLife() {
  lives--;
  sfx("bump");
  if (lives <= 0) {
    over = true;
    newRecord = points > 0 && points >= best;
    sfx(newRecord ? "sejr" : "tab");
  }
}

function pop(balloon) {
  sfx("ballon");
  for (var i = 0; i < 10; i++) {
    var angle = i / 10 * Math.PI * 2;
    var speed = random(150, 320);
    pieces.push({
      x: balloon.x, y: balloon.y - 20, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      life: 0.5, color: PIECE_COLORS[i % PIECE_COLORS.length]
    });
  }
  var words = { rainbow: "Regnbue! 🌈", heart: "+1 ❤️", normal: balloon.small ? "+2" : "+1", gold: "+" + GOLD_POINTS + " ⭐", clock: "Langsomt! ⏰", bomb: "Bum! 💥" }[balloon.kind || "normal"];
  floaters.push({ words: words, x: balloon.x, y: balloon.y - 40, life: 0.8 });
}

function update(dt) {
  for (var p = pieces.length - 1; p >= 0; p--) {
    var piece = pieces[p];
    piece.life -= dt;
    piece.x += piece.vx * dt;
    piece.y += piece.vy * dt;
    piece.vy += 600 * dt;
    if (piece.life <= 0) pieces.splice(p, 1);
  }
  for (var f = floaters.length - 1; f >= 0; f--) {
    floaters[f].life -= dt;
    floaters[f].y -= 60 * dt;
    if (floaters[f].life <= 0) floaters.splice(f, 1);
  }
  if (over) return;

  slowTime = Math.max(0, slowTime - dt);
  var pace = slowTime > 0 ? 0.35 : 1;
  clouds.forEach(function (cloud) { cloud.x += cloud.speed * dt; if (cloud.x > WIDTH + 150) cloud.x = -150; });
  var nowLevel = 1 + Math.floor(points / POINTS_PER_LEVEL);
  if (nowLevel > level) {
    level = nowLevel;
    floaters.push({ words: "Niveau " + level + "! 🚀", x: WIDTH / 2, y: HEIGHT / 2 - 30, life: 2.2, big: true });
    floaters.push({ words: UNLOCKS[level] || "Endnu hurtigere! 💨", x: WIDTH / 2, y: HEIGHT / 2 + 40, life: 2.2 });
    sfx("sejr");
  }
  if (Math.random() < dt * (1 + Math.min(level, 12) * 0.3) * pace) {
    var x = random(100, WIDTH - 100);
    if (level >= 9 && Math.random() < 0.12) {
      spawnBalloon(x - 45, HEIGHT + 90, "normal");
      spawnBalloon(x + 45, HEIGHT + 90, "normal");
      spawnBalloon(x, HEIGHT + 40, "normal");
    } else {
      spawnBalloon(x, HEIGHT + 80, balloonKind());
    }
  }
  for (var i = balloons.length - 1; i >= 0; i--) {
    balloons[i].y -= balloons[i].speed * pace * (HEIGHT / 768) * dt;
    balloons[i].phase += dt * 2.5;
    if (balloons[i].zigzag) balloons[i].x = balloons[i].baseX + Math.sin(balloons[i].phase) * 90;
    if (balloons[i].y < -60) {
      var missed = balloons[i];
      balloons.splice(i, 1);
      if (missed.kind === "normal") loseLife();
    }
  }
}

function draw() {
  var sky = SKIES[Math.min(level, SKIES.length) - 1];
  clear(sky.sky);
  box(0, HEIGHT * 0.6, WIDTH, HEIGHT * 0.4, sky.low);
  if (sky.night) {
    if (stars.length === 0) for (var st = 0; st < 40; st++) stars.push({ x: random(0, 1800), y: random(0, 1200) });
    stars.forEach(function (star) { if (star.x < WIDTH && star.y < HEIGHT) box(star.x, star.y, 3, 3, "#fff"); });
    circle(WIDTH - 140, hudTop() + 210, 56, sky.sun);
    circle(WIDTH - 118, hudTop() + 198, 50, sky.sky);
  } else {
    circle(WIDTH - 140, hudTop() + 210, 60, sky.sun);
  }
  var cloudColor = sky.night ? "#3b4a8a" : "#fff";
  clouds.forEach(function (cloud) {
    var k = cloud.size;
    circle(cloud.x, cloud.y, 40 * k, cloudColor);
    circle(cloud.x + 40 * k, cloud.y - 18 * k, 50 * k, cloudColor);
    circle(cloud.x + 85 * k, cloud.y, 38 * k, cloudColor);
    box(cloud.x, cloud.y, 85 * k, 38 * k, cloudColor);
  });
  if (slowTime > 0) box(0, 0, WIDTH, HEIGHT, "rgba(120,80,200,0.18)");
  balloons.forEach(drawBalloon);
  pieces.forEach(function (piece) { box(piece.x - 5, piece.y - 5, 10, 10, piece.color); });
  floaters.forEach(function (f) { text(f.words, f.x, f.y, f.big ? 64 : 36, "#fff"); });

  var top = hudTop();
  var hudWidth = Math.min(500, WIDTH - 40);
  box(WIDTH / 2 - hudWidth / 2, top - 30, hudWidth, 108, "rgba(0,60,120,0.3)");
  text("Point: " + points + "  ·  Niveau " + level, WIDTH / 2, top, 40);
  var hearts = "";
  for (var h = 0; h < Math.max(LIVES, lives); h++) hearts += h < lives ? "❤️" : "🖤";
  text(hearts, WIDTH / 2, top + 48, 32);
  text(player().emoji + " 🏆 " + best, WIDTH - 120, 36, 26);
  box(WIDTH - 220, 62, 200, 64, "rgba(0,60,120,0.45)");
  text("🏆 Rekorder", WIDTH - 120, 94, 24);

  if (over) {
    var cx = WIDTH / 2, cy = HEIGHT / 2;
    box(0, 0, WIDTH, HEIGHT, "rgba(0,0,0,0.45)");
    box(cx - 250, cy - 190, 500, 380, "#fff8e7");
    text(newRecord ? "🏆 Ny rekord!" : "Spillet er slut", cx, cy - 124, 48, "#222");
    text(points + " point", cx, cy - 44, 64, "#e64980");
    text("Rekord: " + best + "  ·  Niveau " + level, cx, cy + 21, 28, "#555");
    box(cx - 120, cy + 66, 240, 90, "#2f9e44");
    text("🔁 Igen", cx, cy + 111, 36);
  }
}

function balloonBody(b, radius, color) {
  if (b.kind === "heart") {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, radius * 0.9);
    ctx.bezierCurveTo(-radius * 1.5, -radius * 0.2, -radius * 0.6, -radius * 1.3, 0, -radius * 0.45);
    ctx.bezierCurveTo(radius * 0.6, -radius * 1.3, radius * 1.5, -radius * 0.2, 0, radius * 0.9);
    ctx.fill();
    return;
  }
  ctx.save();
  ctx.scale(1, 1.2);
  circle(0, 0, radius, color);
  ctx.restore();
}

// The score sits below the 🏠 ↺ 👤 buttons and the Rekorder button when they would overlap.
function hudTop() {
  var crowded = WIDTH / 2 + 250 > WIDTH - 220 || WIDTH / 2 - 250 < RESERVED.w;
  return crowded ? Math.max(RESERVED.h, 126) + 50 : 50;
}

function drawBalloon(b) {
  if (b.kind === "bomb") { emoji("💣", b.x, b.y, 96); return; }
  var radius = b.small ? 30 : 44;
  var sway = Math.sin(b.phase) * 8;
  ctx.strokeStyle = "rgba(60,60,60,0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(b.x, b.y + radius * 1.25);
  ctx.quadraticCurveTo(b.x - 12 + sway, b.y + radius * 1.8, b.x + sway * 0.5, b.y + radius * 2.3);
  ctx.quadraticCurveTo(b.x + 12 + sway, b.y + radius * 2.8, b.x + sway, b.y + radius * 3.2);
  ctx.stroke();

  ctx.save();
  ctx.translate(b.x, b.y);
  if (b.kind === "rainbow") {
    ctx.save();
    ctx.scale(1, 1.2);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.clip();
    var colors = ["#ff6b6b", "#ffa94d", "#ffd43b", "#51cf66", "#4dabf7", "#845ef7"];
    colors.forEach(function (c, i) { box(-radius, -radius + i * radius / 3, radius * 2, radius / 3 + 1, c); });
    ctx.restore();
  } else {
    balloonBody(b, radius, b.dark);
    ctx.translate(-radius * 0.08, -radius * 0.1);
    balloonBody(b, radius * 0.9, b.color);
    if (b.pattern === "stripes") {
      ctx.save();
      ctx.scale(1, 1.2);
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.9, 0, Math.PI * 2);
      ctx.clip();
      for (var sx = -radius; sx < radius; sx += radius * 0.5) box(sx, -radius, radius * 0.16, radius * 2, b.light);
      ctx.restore();
    } else if (b.pattern === "dots") {
      circle(-radius * 0.3, radius * 0.2, radius * 0.12, b.light);
      circle(radius * 0.3, -radius * 0.1, radius * 0.12, b.light);
      circle(0, radius * 0.55, radius * 0.1, b.light);
      circle(radius * 0.15, -radius * 0.6, radius * 0.1, b.light);
    }
    ctx.save();
    ctx.rotate(-0.5);
    ctx.scale(0.55, 1);
    circle(-radius * 0.55, -radius * 0.45, radius * 0.32, "rgba(255,255,255,0.55)");
    ctx.restore();
    if (b.pattern === "shine") circle(radius * 0.35, radius * 0.45, radius * 0.08, "rgba(255,255,255,0.6)");
  }
  ctx.restore();

  ctx.fillStyle = b.dark;
  ctx.beginPath();
  ctx.moveTo(b.x - 7, b.y + radius * 1.3);
  ctx.lineTo(b.x + 7, b.y + radius * 1.3);
  ctx.lineTo(b.x, b.y + radius * 1.12);
  ctx.closePath();
  ctx.fill();
  if (b.kind === "gold") emoji("⭐", b.x, b.y, radius);
  if (b.kind === "clock") emoji("⏰", b.x, b.y, radius);
  if (b.small && b.kind === "normal") text("2", b.x, b.y, 26, "#fff");
}

function onTap(x, y) {
  if (over) {
    if (Math.abs(x - WIDTH / 2) < 120 && y > HEIGHT / 2 + 66 && y < HEIGHT / 2 + 156) { restart(); sfx("hop"); }
    return;
  }
  if (x > WIDTH - 220 && x < WIDTH - 20 && y > 62 && y < 126) { showRecords("best", " point"); sfx("klik"); return; }
  for (var i = balloons.length - 1; i >= 0; i--) {
    if (distance(x, y, balloons[i].x, balloons[i].y) < 70) {
      var hit = balloons[i];
      pop(hit);
      balloons.splice(i, 1);
      if (hit.kind === "bomb") { sfx("eksplosion"); loseLife(); return; }
      if (hit.kind === "rainbow") {
        var count = 0;
        for (var j = balloons.length - 1; j >= 0; j--) {
          if (balloons[j].kind === "bomb") continue;
          pop(balloons[j]);
          count += balloons[j].kind === "gold" ? GOLD_POINTS : 1;
          balloons.splice(j, 1);
        }
        points += count + 1;
        sfx("sejr");
      } else if (hit.kind === "heart") { lives = Math.min(MAX_LIVES, lives + 1); points++; sfx("boing"); }
      else if (hit.kind === "clock") { slowTime = SLOW_SECONDS; sfx("boing"); points++; }
      else if (hit.kind === "gold") { points += GOLD_POINTS; sfx("mont"); }
      else { points += hit.small ? 2 : 1; }
      if (points > best) { best = points; playerSave("best", best); }
      return;
    }
  }
}
