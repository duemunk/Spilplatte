useFont("rund");
window.HI_RES = true;
window.ADAPTIVE = true;
window.USES_PLAYERS = true;

var DIRECTIONS = {
  right: { dr: 0, dc: 1, angle: 0, color: "#ff6b6b" },
  down: { dr: 1, dc: 0, angle: Math.PI / 2, color: "#fcc419" },
  left: { dr: 0, dc: -1, angle: Math.PI, color: "#4dabf7" },
  up: { dr: -1, dc: 0, angle: -Math.PI / 2, color: "#51cf66" }
};
var DIRECTION_NAMES = ["right", "down", "left", "up"];
var SLIDE_SECONDS = 0.28;
var SHAKE_SECONDS = 0.3;

var DIFFICULTIES = [
  { key: "let", name: "Let 🙂", base: 3, max: 5, fill: 0.55, tricky: 0.1, color: "#51cf66" },
  { key: "mellem", name: "Mellem 😎", base: 4, max: 7, fill: 0.7, tricky: 0.4, color: "#4dabf7" },
  { key: "svaer", name: "Svær 🔥", base: 5, max: 8, fill: 0.8, tricky: 0.7, color: "#ff922b" },
  { key: "ekspert", name: "Ekspert 🤯", base: 6, max: 9, fill: 0.9, tricky: 0.95, color: "#e64980" }
];
var difficulty = DIFFICULTIES[1];
var choosing = false;
var level = 1;
var size = 4;
var grid = [];
var leaving = [];
var shake = null;
var won = false;
var ui = {};

function levelSize(n) { return Math.min(difficulty.max, difficulty.base + Math.floor((n - 1) / 2)); }

function pathLength(r, c, name) {
  var d = DIRECTIONS[name];
  if (d.dr) return d.dr > 0 ? size - 1 - r : r;
  return d.dc > 0 ? size - 1 - c : c;
}

// Arrows are placed one by one, each only where its way out is free at that moment. Taking
// them out in the reverse order always works, so every level can be solved.
function buildLevel() {
  size = levelSize(level);
  grid = [];
  for (var r = 0; r < size; r++) { var row = []; for (var c = 0; c < size; c++) row.push(null); grid.push(row); }
  var target = Math.round(size * size * Math.min(0.95, difficulty.fill + level * 0.01));
  var placed = 0;
  for (var tries = 0; tries < 2000 && placed < target; tries++) {
    var rr = Math.floor(Math.random() * size);
    var cc = Math.floor(Math.random() * size);
    if (grid[rr][cc]) continue;
    var options = DIRECTION_NAMES.filter(function (name) { return pathFree(rr, cc, name); });
    if (options.length === 0) continue;
    // Harder levels point arrows across the board, so they block more of the others.
    if (Math.random() < difficulty.tricky) options.sort(function (a, b) { return pathLength(rr, cc, b) - pathLength(rr, cc, a); });
    else options.sort(function () { return Math.random() - 0.5; });
    grid[rr][cc] = options[0];
    placed++;
  }
  leaving = [];
  won = false;
}

function pathFree(r, c, name) {
  var d = DIRECTIONS[name];
  for (var rr = r + d.dr, cc = c + d.dc; rr >= 0 && rr < size && cc >= 0 && cc < size; rr += d.dr, cc += d.dc) {
    if (grid[rr][cc]) return false;
  }
  return true;
}

function arrowsLeft() {
  var count = 0;
  for (var r = 0; r < size; r++) for (var c = 0; c < size; c++) if (grid[r][c]) count++;
  return count;
}

function chooseDifficulty(key) {
  DIFFICULTIES.forEach(function (d) { if (d.key === key) difficulty = d; });
  playerSave("difficulty", difficulty.key);
  level = playerLoad("level-" + difficulty.key, 1);
  buildLevel();
}

function setup() {
  chooseDifficulty(playerLoad("difficulty", "mellem"));
}

function onLayout() {
  var portrait = HEIGHT > WIDTH;
  var top = Math.max(RESERVED.h + 20, 20);
  var boardSize = portrait ? Math.min(WIDTH - 60, HEIGHT - top - 300) : Math.min(HEIGHT - top - 130, WIDTH - 420);
  ui.board = { x: portrait ? (WIDTH - boardSize) / 2 : (WIDTH - boardSize - 260) / 2, y: portrait ? top + 120 : top + 70, size: boardSize };
  if (!portrait && ui.board.x < RESERVED.w + 10 && ui.board.y < RESERVED.h) ui.board.y = RESERVED.h + 10;
  var center = ui.board.x + boardSize / 2;
  ui.title = { x: center, y: portrait ? top + 30 : top + 10 };
  ui.info = { x: center, y: portrait ? top + 80 : top + 46 };
  var below = ui.board.y + boardSize + 20;
  ui.restart = portrait
    ? { x: WIDTH / 2 - 230, y: below, w: 220, h: 80 }
    : { x: ui.board.x + boardSize + 40, y: ui.board.y + boardSize - 180, w: 220, h: 80 };
  ui.difficulty = portrait
    ? { x: WIDTH / 2 - 110, y: below + 100, w: 220, h: 80 }
    : { x: ui.board.x + boardSize + 40, y: ui.board.y + boardSize - 280, w: 220, h: 80 };
  ui.records = portrait
    ? { x: WIDTH / 2 + 10, y: below, w: 220, h: 80 }
    : { x: ui.board.x + boardSize + 40, y: ui.board.y + boardSize - 80, w: 220, h: 80 };
}

function cellSize() { return ui.board.size / size; }

function update(dt) {
  for (var i = leaving.length - 1; i >= 0; i--) {
    leaving[i].t += dt;
    if (leaving[i].t > SLIDE_SECONDS) leaving.splice(i, 1);
  }
  if (shake) { shake.t += dt; if (shake.t > SHAKE_SECONDS) shake = null; }
}

function drawArrow(x, y, cell, name, alpha) {
  var d = DIRECTIONS[name];
  var pad = cell * 0.08;
  ctx.globalAlpha = alpha;
  box(x + pad, y + pad, cell - pad * 2, cell - pad * 2, d.color);
  box(x + pad, y + pad, cell - pad * 2, cell * 0.1, "rgba(255,255,255,0.25)");
  ctx.save();
  ctx.translate(x + cell / 2, y + cell / 2);
  ctx.rotate(d.angle);
  var k = cell * 0.32;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(k, 0);
  ctx.lineTo(0, k * 0.8);
  ctx.lineTo(0, k * 0.32);
  ctx.lineTo(-k, k * 0.32);
  ctx.lineTo(-k, -k * 0.32);
  ctx.lineTo(0, -k * 0.32);
  ctx.lineTo(0, -k * 0.8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.globalAlpha = 1;
}

function button(r, label, color) {
  box(r.x, r.y + 5, r.w, r.h, "rgba(0,0,0,0.3)");
  box(r.x, r.y, r.w, r.h, color);
  text(label, r.x + r.w / 2, r.y + r.h / 2, 24);
}

function draw() {
  clear("#0f3d3e");
  text("Pillås", ui.title.x, ui.title.y, 44, "#ffd43b");
  text(player().emoji + " " + difficulty.name + " · Bane " + level + "  ·  Pile: " + arrowsLeft(), ui.info.x, ui.info.y, 24, "#c3fae8");
  var b = ui.board;
  var cell = cellSize();
  box(b.x - 8, b.y - 8, b.size + 16, b.size + 16, "#0a2a2b");
  for (var r = 0; r < size; r++) {
    for (var c = 0; c < size; c++) {
      var x = b.x + c * cell, y = b.y + r * cell;
      box(x + 2, y + 2, cell - 4, cell - 4, "#164e50");
      if (!grid[r][c]) continue;
      var offset = 0;
      if (shake && shake.r === r && shake.c === c) offset = Math.sin(shake.t * 60) * cell * 0.08;
      var d = DIRECTIONS[grid[r][c]];
      drawArrow(x + offset * Math.abs(d.dc || 1), y, cell, grid[r][c], 1);
      if (shake && shake.r === r && shake.c === c) box(x + 4, y + 4, cell - 8, cell - 8, "rgba(255,0,0,0.25)");
    }
  }
  leaving.forEach(function (arrow) {
    var d = DIRECTIONS[arrow.name];
    var travel = (arrow.t / SLIDE_SECONDS) * b.size;
    drawArrow(b.x + arrow.c * cell + d.dc * travel, b.y + arrow.r * cell + d.dr * travel, cell, arrow.name, 1 - arrow.t / SLIDE_SECONDS);
  });
  button(ui.restart, "🔁 Forfra", "#868e96");
  button(ui.records, "🏆 Rekorder", "#5c7cfa");
  button(ui.difficulty, difficulty.name, difficulty.color);
  if (level === 1 && arrowsLeft() > 0 && !won) text("👆 Tryk på en pil, der kan flyve ud", WIDTH / 2, ui.board.y + ui.board.size + (HEIGHT > WIDTH ? 230 : 40), 22, "#c3fae8");

  if (choosing) {
    var mx = WIDTH / 2, my = HEIGHT / 2;
    box(0, 0, WIDTH, HEIGHT, "rgba(0,0,0,0.55)");
    box(mx - 260, my - 250, 520, 500, "#fff8e7");
    text("Hvor svært skal det være?", mx, my - 200, 30, "#222");
    DIFFICULTIES.forEach(function (d, i) {
      var r = { x: mx - 200, y: my - 150 + i * 95, w: 400, h: 80 };
      box(r.x, r.y, r.w, r.h, d === difficulty ? d.color : "#adb5bd");
      text(d.name + "  ·  bane " + playerLoad("level-" + d.key, 1), mx, r.y + 40, 28);
    });
  }
  if (won) {
    var cx = WIDTH / 2, cy = HEIGHT / 2;
    box(0, 0, WIDTH, HEIGHT, "rgba(0,0,0,0.5)");
    box(cx - 250, cy - 150, 500, 300, "#fff8e7");
    text("Bane " + level + " klaret! 🎉", cx, cy - 80, 40, "#222");
    box(cx - 140, cy + 10, 280, 90, "#2f9e44");
    text("Næste bane ▶", cx, cy + 55, 32);
  }
}

function inRect(x, y, r) { return x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h; }

function onTap(x, y) {
  if (won) {
    if (Math.abs(x - WIDTH / 2) < 140 && y > HEIGHT / 2 + 10 && y < HEIGHT / 2 + 100) {
      level++;
      buildLevel();
      sfx("hop");
    }
    return;
  }
  if (choosing) {
    DIFFICULTIES.forEach(function (d, i) {
      if (inRect(x, y, { x: WIDTH / 2 - 200, y: HEIGHT / 2 - 150 + i * 95, w: 400, h: 80 })) { chooseDifficulty(d.key); sfx("hop"); }
    });
    choosing = false;
    return;
  }
  if (inRect(x, y, ui.restart)) { buildLevel(); sfx("klik"); return; }
  if (inRect(x, y, ui.difficulty)) { choosing = true; sfx("klik"); return; }
  if (inRect(x, y, ui.records)) { showRecords("level-" + difficulty.key, ". bane"); sfx("klik"); return; }
  var b = ui.board;
  var cell = cellSize();
  var c = Math.floor((x - b.x) / cell);
  var r = Math.floor((y - b.y) / cell);
  if (r < 0 || r >= size || c < 0 || c >= size || !grid[r][c]) return;
  var name = grid[r][c];
  if (!pathFree(r, c, name)) { shake = { r: r, c: c, t: 0 }; sfx("bump"); return; }
  grid[r][c] = null;
  leaving.push({ r: r, c: c, name: name, t: 0 });
  sfx("hop");
  if (arrowsLeft() === 0) {
    won = true;
    playerSave("level-" + difficulty.key, level + 1);
    setTimeout(function () { sfx("sejr"); }, 250);
  }
}
