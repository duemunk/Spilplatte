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
}

function balloonKind() {
  var roll = Math.random();
  if (points > 5 && roll < 0.1) return "bomb";
  if (roll < 0.18) return "gold";
  if (roll < 0.23) return "clock";
  return "normal";
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
  for (var i = 0; i < 10; i++) {
    var angle = i / 10 * Math.PI * 2;
    var speed = random(150, 320);
    pieces.push({
      x: balloon.x, y: balloon.y - 20, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      life: 0.5, color: PIECE_COLORS[i % PIECE_COLORS.length]
    });
  }
  var words = { normal: balloon.small ? "+2" : "+1", gold: "+" + GOLD_POINTS + " ⭐", clock: "Langsomt! ⏰", bomb: "Bum! 💥" }[balloon.kind || "normal"];
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
    floaters.push({ words: "Niveau " + level + "! 🚀", x: WIDTH / 2, y: HEIGHT / 2, life: 1.6, big: true });
    sfx("sejr");
  }
  if (Math.random() < dt * (1 + level * 0.35) * pace) {
    var small = Math.random() < 0.3;
    balloons.push({
      x: random(80, WIDTH - 80), y: HEIGHT + 80, kind: balloonKind(), small: small,
      speed: (random(70, 160) + level * 25) * (small ? 1.5 : 1),
      color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)]
    });
  }
  for (var i = balloons.length - 1; i >= 0; i--) {
    balloons[i].y -= balloons[i].speed * pace * dt;
    if (balloons[i].y < -60) {
      var missed = balloons[i];
      balloons.splice(i, 1);
      if (missed.kind === "normal") loseLife();
    }
  }
}

function draw() {
  clear("#87ceeb");
  box(0, HEIGHT * 0.6, WIDTH, HEIGHT * 0.4, "#a5d8ff");
  circle(WIDTH - 140, 260, 60, "#fff3bf");
  clouds.forEach(function (cloud) {
    var k = cloud.size;
    circle(cloud.x, cloud.y, 40 * k, "#fff");
    circle(cloud.x + 40 * k, cloud.y - 18 * k, 50 * k, "#fff");
    circle(cloud.x + 85 * k, cloud.y, 38 * k, "#fff");
    box(cloud.x, cloud.y, 85 * k, 38 * k, "#fff");
  });
  if (slowTime > 0) box(0, 0, WIDTH, HEIGHT, "rgba(120,80,200,0.18)");
  balloons.forEach(drawBalloon);
  pieces.forEach(function (piece) { box(piece.x - 5, piece.y - 5, 10, 10, piece.color); });
  floaters.forEach(function (f) { text(f.words, f.x, f.y, f.big ? 64 : 36, "#fff"); });

  var top = Math.max(50, RESERVED.h + 20);
  box(WIDTH / 2 - 250, top - 30, 500, 108, "rgba(0,60,120,0.3)");
  text("Point: " + points + "  ·  Niveau " + level, WIDTH / 2, top, 40);
  var hearts = "";
  for (var h = 0; h < LIVES; h++) hearts += h < lives ? "❤️" : "🖤";
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

function drawBalloon(b) {
  if (b.kind === "bomb") { emoji("💣", b.x, b.y, 96); return; }
  var radius = b.small ? 30 : 44;
  var color = b.kind === "gold" ? "#fcc419" : b.kind === "clock" ? "#9775fa" : b.color;
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(b.x, b.y + radius * 1.2);
  ctx.quadraticCurveTo(b.x - 10, b.y + radius * 1.9, b.x + 4, b.y + radius * 2.6);
  ctx.stroke();
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.scale(1, 1.2);
  circle(0, 0, radius, color);
  circle(-radius * 0.35, -radius * 0.4, radius * 0.22, "rgba(255,255,255,0.45)");
  ctx.restore();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(b.x - 6, b.y + radius * 1.25);
  ctx.lineTo(b.x + 6, b.y + radius * 1.25);
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
      if (hit.kind === "clock") { slowTime = SLOW_SECONDS; sfx("boing"); points++; }
      else if (hit.kind === "gold") { points += GOLD_POINTS; sfx("mont"); }
      else { points += hit.small ? 2 : 1; sfx("pop"); }
      if (points > best) { best = points; playerSave("best", best); }
      return;
    }
  }
}
