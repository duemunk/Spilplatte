useFont("tusch");
window.HI_RES = true;
window.USES_PLAYERS = true;

var LIVES = 3;
var SLOW_SECONDS = 4;
var GOLD_POINTS = 5;
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
  var words = { normal: "+1", gold: "+" + GOLD_POINTS + " ⭐", clock: "Langsomt! ⏰", bomb: "Bum! 💥" }[balloon.kind || "normal"];
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
  if (Math.random() < dt * 1.5 * pace) {
    balloons.push({ x: random(80, WIDTH - 80), y: HEIGHT + 80, speed: random(80, 200) + points * 4, kind: balloonKind() });
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
  if (slowTime > 0) box(0, 0, WIDTH, HEIGHT, "rgba(120,80,200,0.18)");
  balloons.forEach(function (b) {
    if (b.kind === "bomb") { emoji("💣", b.x, b.y, 96); return; }
    emoji("🎈", b.x, b.y, 110);
    if (b.kind === "gold") emoji("⭐", b.x - 8, b.y - 18, 44);
    if (b.kind === "clock") emoji("⏰", b.x - 8, b.y - 18, 44);
  });
  pieces.forEach(function (piece) { box(piece.x - 5, piece.y - 5, 10, 10, piece.color); });
  floaters.forEach(function (f) { text(f.words, f.x, f.y, 36, "#fff"); });

  text("Point: " + points, WIDTH / 2, 50, 44);
  var hearts = "";
  for (var h = 0; h < LIVES; h++) hearts += h < lives ? "❤️" : "🖤";
  text(hearts, WIDTH / 2, 100, 32);
  text(player().emoji + " 🏆 " + best, WIDTH - 140, 50, 28);
  box(WIDTH - 220, 80, 200, 64, "rgba(0,0,0,0.25)");
  text("🏆 Rekorder", WIDTH - 120, 112, 24);

  if (over) {
    box(0, 0, WIDTH, HEIGHT, "rgba(0,0,0,0.45)");
    box(262, 190, 500, 380, "#fff8e7");
    text(newRecord ? "🏆 Ny rekord!" : "Spillet er slut", WIDTH / 2, 260, 48, "#222");
    text(points + " point", WIDTH / 2, 340, 64, "#e64980");
    text("Rekord: " + best, WIDTH / 2, 405, 28, "#555");
    box(392, 450, 240, 90, "#2f9e44");
    text("🔁 Igen", WIDTH / 2, 495, 36);
  }
}

function onTap(x, y) {
  if (over) {
    if (x > 392 && x < 632 && y > 450 && y < 540) { restart(); sfx("hop"); }
    return;
  }
  if (x > WIDTH - 220 && x < WIDTH - 20 && y > 80 && y < 144) { showRecords("best", " point"); sfx("klik"); return; }
  for (var i = balloons.length - 1; i >= 0; i--) {
    if (distance(x, y, balloons[i].x, balloons[i].y) < 70) {
      var hit = balloons[i];
      pop(hit);
      balloons.splice(i, 1);
      if (hit.kind === "bomb") { sfx("eksplosion"); loseLife(); return; }
      if (hit.kind === "clock") { slowTime = SLOW_SECONDS; sfx("boing"); points++; }
      else if (hit.kind === "gold") { points += GOLD_POINTS; sfx("mont"); }
      else { points++; sfx("pop"); }
      if (points > best) { best = points; playerSave("best", best); }
      return;
    }
  }
}
