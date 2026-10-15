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

var level = 1;
var size = 4;
var grid = [];
var leaving = [];
var shake = null;
var won = false;
var ui = {};

function levelSize(n) { return Math.min(8, 3 + Math.ceil(n / 2)); }

// Arrows are placed one by one, each only where its way out is free at that moment. Taking
// them out in the reverse order always works, so every level can be solved.
function buildLevel() {
  size = levelSize(level);
  grid = [];
  for (var r = 0; r < size; r++) { var row = []; for (var c = 0; c < size; c++) row.push(null); grid.push(row); }
  var target = Math.round(size * size * Math.min(0.85, 0.55 + level * 0.03));
  var placed = 0;
  for (var tries = 0; tries < 2000 && placed < target; tries++) {
    var rr = Math.floor(Math.random() * size);
    var cc = Math.floor(Math.random() * size);
    if (grid[rr][cc]) continue;
    var options = DIRECTION_NAMES.filter(function (name) { return pathFree(rr, cc, name); });
    if (options.length === 0) continue;
    grid[rr][cc] = options[Math.floor(Math.random() * options.length)];
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

function setup() {
  level = playerLoad("level", 1);
  buildLevel();
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
  text(player().emoji + " Bane " + level + "  ·  Pile tilbage: " + arrowsLeft(), ui.info.x, ui.info.y, 24, "#c3fae8");
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
  button(ui.restart, "🔁 Forfra", "#e64980");
  button(ui.records, "🏆 Rekorder", "#5c7cfa");
  if (level === 1 && arrowsLeft() > 0 && !won) text("👆 Tryk på en pil, der kan flyve ud", WIDTH / 2, ui.board.y + ui.board.size + (HEIGHT > WIDTH ? 140 : 40), 22, "#c3fae8");

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
  if (inRect(x, y, ui.restart)) { buildLevel(); sfx("klik"); return; }
  if (inRect(x, y, ui.records)) { showRecords("level", ". bane"); sfx("klik"); return; }
  var b = ui.board;
  var cell = cellSize();
  var c = Math.floor((x - b.x) / cell);
  var r = Math.floor((y - b.y) / cell);
  if (r < 0 || r >= size || c < 0 || c >= size || !grid[r][c]) return;
  var name = grid[r][c];
  if (!pathFree(r, c, name)) { shake = { r: r, c: c, t: 0 }; sfx("bump"); return; }
  grid[r][c] = null;
  leaving.push({ r: r, c: c, name: name, t: 0 });
  sfx("laser");
  if (arrowsLeft() === 0) {
    won = true;
    playerSave("level", level + 1);
    setTimeout(function () { sfx("sejr"); }, 250);
  }
}
