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
  { key: "baby", name: "Baby 🍼", base: 3, max: 4, fill: 0.4, tricky: 0, tail: [1, 1], color: "#ffc9c9" },
  { key: "let", name: "Let 🙂", base: 3, max: 5, fill: 0.55, tricky: 0.1, tail: [1, 2], color: "#51cf66" },
  { key: "mellem", name: "Mellem 😎", base: 4, max: 7, fill: 0.7, tricky: 0.4, tail: [1, 3], color: "#4dabf7" },
  { key: "svaer", name: "Svær 🔥", base: 5, max: 8, fill: 0.8, tricky: 0.7, tail: [2, 3], color: "#ff922b" },
  { key: "ekspert", name: "Ekspert 🤯", base: 6, max: 9, fill: 0.9, tricky: 0.95, tail: [2, 4], color: "#e64980" },
  { key: "mester", name: "Mester 👑", base: 7, max: 10, fill: 0.95, tricky: 1, tail: [2, 5], color: "#845ef7" },
  { key: "umulig", name: "Umulig 💀", base: 8, max: 12, fill: 1, tricky: 1, tail: [3, 6], color: "#343a40" },
  { key: "vulkan", name: "Vulkan 🌋", base: 9, max: 13, fill: 1, tricky: 1, tail: [3, 7], color: "#c92a2a" },
  { key: "galakse", name: "Galakse 🌌", base: 10, max: 14, fill: 1, tricky: 1, tail: [4, 8], color: "#3b5bdb" },
  { key: "gud", name: "Gud 😇", base: 12, max: 15, fill: 1, tricky: 1, tail: [4, 10], color: "#f59f00" }
];
var difficulty = DIFFICULTIES[1];
var choosing = false;
var level = 1;
var size = 4;
var grid = [];
var arrows = [];
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

// An arrow is a head cell plus a tail of cells behind it. Arrows are placed one by one, each
// only where its tail fits and its way out is free at that moment. Taking them out in the
// reverse order always works, so every level can be solved.
function cellsOf(r, c, name, length) {
  var d = DIRECTIONS[name];
  var cells = [];
  for (var i = 0; i < length; i++) cells.push([r - d.dr * i, c - d.dc * i]);
  return cells;
}

function inside(r, c) { return r >= 0 && r < size && c >= 0 && c < size; }

function pathFree(r, c, name) {
  var d = DIRECTIONS[name];
  for (var rr = r + d.dr, cc = c + d.dc; inside(rr, cc); rr += d.dr, cc += d.dc) {
    if (grid[rr][cc] !== null) return false;
  }
  return true;
}

function buildLevel() {
  size = levelSize(level);
  grid = [];
  arrows = [];
  for (var r = 0; r < size; r++) { var row = []; for (var c = 0; c < size; c++) row.push(null); grid.push(row); }
  var target = Math.round(size * size * Math.min(0.95, difficulty.fill + level * 0.01));
  var filled = 0;
  for (var tries = 0; tries < 9000 && filled < target; tries++) {
    var rr = Math.floor(Math.random() * size);
    var cc = Math.floor(Math.random() * size);
    if (grid[rr][cc] !== null) continue;
    var length = difficulty.tail[0] + Math.floor(Math.random() * (difficulty.tail[1] - difficulty.tail[0] + 1));
    var options = DIRECTION_NAMES.filter(function (name) {
      var cells = cellsOf(rr, cc, name, length);
      return cells.every(function (cell) { return inside(cell[0], cell[1]) && grid[cell[0]][cell[1]] === null; }) && pathFree(rr, cc, name);
    });
    if (options.length === 0) continue;
    // Harder levels point arrows across the board, so they block more of the others.
    if (Math.random() < difficulty.tricky) options.sort(function (a, b) { return pathLength(rr, cc, b) - pathLength(rr, cc, a); });
    else options.sort(function () { return Math.random() - 0.5; });
    var arrow = { id: arrows.length, dir: options[0], cells: cellsOf(rr, cc, options[0], length) };
    arrows.push(arrow);
    arrow.cells.forEach(function (cell) { grid[cell[0]][cell[1]] = arrow.id; });
    filled += length;
  }
  leaving = [];
  won = false;
}

function arrowsLeft() {
  return arrows.filter(function (arrow) { return !arrow.gone; }).length;
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

function drawArrow(arrow, offsetX, offsetY, alpha) {
  var b = ui.board;
  var cell = cellSize();
  var d = DIRECTIONS[arrow.dir];
  var head = arrow.cells[0];
  var tail = arrow.cells[arrow.cells.length - 1];
  var hx = b.x + head[1] * cell + cell / 2 + offsetX, hy = b.y + head[0] * cell + cell / 2 + offsetY;
  var tx = b.x + tail[1] * cell + cell / 2 + offsetX, ty = b.y + tail[0] * cell + cell / 2 + offsetY;
  if (arrow.cells.length === 1) {
    tx -= d.dc * cell * 0.3; ty -= d.dr * cell * 0.3;
    hx += d.dc * cell * 0.05; hy += d.dr * cell * 0.05;
  }
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = d.color;
  ctx.lineCap = "round";
  ctx.lineWidth = cell * 0.26;
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(hx, hy);
  ctx.stroke();
  ctx.save();
  ctx.translate(tx, ty);
  ctx.rotate(d.angle);
  ctx.fillStyle = d.color;
  [-1, 1].forEach(function (side) {
    ctx.beginPath();
    ctx.moveTo(cell * 0.1, 0);
    ctx.lineTo(-cell * 0.2, side * cell * 0.3);
    ctx.lineTo(-cell * 0.32, side * cell * 0.3);
    ctx.lineTo(-cell * 0.08, 0);
    ctx.closePath();
    ctx.fill();
  });
  ctx.restore();
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(d.angle);
  ctx.fillStyle = d.color;
  ctx.beginPath();
  ctx.moveTo(cell * 0.42, 0);
  ctx.lineTo(-cell * 0.05, cell * 0.36);
  ctx.lineTo(-cell * 0.05, -cell * 0.36);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.moveTo(cell * 0.3, 0);
  ctx.lineTo(0, cell * 0.22);
  ctx.lineTo(0, 0);
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
  for (var r = 0; r < size; r++) for (var c = 0; c < size; c++) box(b.x + c * cell + 2, b.y + r * cell + 2, cell - 4, cell - 4, "#164e50");
  arrows.forEach(function (arrow) {
    if (arrow.gone) return;
    var offset = shake && shake.id === arrow.id ? Math.sin(shake.t * 60) * cell * 0.08 : 0;
    drawArrow(arrow, offset, 0, 1);
    if (shake && shake.id === arrow.id) {
      arrow.cells.forEach(function (cellPos) { box(b.x + cellPos[1] * cell + 4, b.y + cellPos[0] * cell + 4, cell - 8, cell - 8, "rgba(255,0,0,0.22)"); });
    }
  });
  leaving.forEach(function (item) {
    var d = DIRECTIONS[item.arrow.dir];
    var travel = (item.t / SLIDE_SECONDS) * b.size;
    drawArrow(item.arrow, d.dc * travel, d.dr * travel, 1 - item.t / SLIDE_SECONDS);
  });
    button(ui.restart, "🔁 Forfra", "#868e96");
  button(ui.records, "🏆 Rekorder", "#5c7cfa");
  button(ui.difficulty, difficulty.name, difficulty.color);
  if (level === 1 && arrowsLeft() > 0 && !won) text("👆 Tryk på en pil, der kan flyve ud", WIDTH / 2, ui.board.y + ui.board.size + (HEIGHT > WIDTH ? 230 : 40), 22, "#c3fae8");

  if (choosing) {
    var mx = WIDTH / 2, my = HEIGHT / 2;
    box(0, 0, WIDTH, HEIGHT, "rgba(0,0,0,0.55)");
    box(mx - 330, my - 320, 660, 620, "#fff8e7");
    text("Hvor svært skal det være?", mx, my - 275, 30, "#222");
    DIFFICULTIES.forEach(function (d, i) {
      var r = difficultyRect(i);
      box(r.x, r.y, r.w, r.h, d === difficulty ? d.color : "#adb5bd");
      text(d.name + " · " + playerLoad("level-" + d.key, 1), r.x + r.w / 2, r.y + 42, 26);
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

function difficultyRect(i) { return { x: WIDTH / 2 - 305 + (i % 2) * 310, y: HEIGHT / 2 - 230 + Math.floor(i / 2) * 100, w: 300, h: 84 }; }

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
      if (inRect(x, y, difficultyRect(i))) { chooseDifficulty(d.key); sfx("hop"); }
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
  if (r < 0 || r >= size || c < 0 || c >= size || grid[r][c] === null) return;
  var arrow = arrows[grid[r][c]];
  var head = arrow.cells[0];
  if (!pathFree(head[0], head[1], arrow.dir)) { shake = { id: arrow.id, t: 0 }; sfx("bump"); return; }
  arrow.cells.forEach(function (cellPos) { grid[cellPos[0]][cellPos[1]] = null; });
  arrow.gone = true;
  leaving.push({ arrow: arrow, t: 0 });
  sfx("hop");
  if (arrowsLeft() === 0) {
    won = true;
    playerSave("level-" + difficulty.key, level + 1);
    setTimeout(function () { sfx("sejr"); }, 250);
  }
}
