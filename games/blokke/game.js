useFont("rund");
window.USES_PLAYERS = true;
window.HI_RES = true;
window.ADAPTIVE = true;

var SIZE = 8;
var CELL = 72;
var BOARD_PIXELS = 8 * 72;
var BOARD_X = 0;
var BOARD_Y = 0;
var ui = {};

function onLayout() {
  if (HEIGHT > WIDTH) {
    var top = Math.max(RESERVED.h + 20, (HEIGHT - (BOARD_PIXELS + 420)) / 2);
    BOARD_X = (WIDTH - BOARD_PIXELS) / 2;
    BOARD_Y = top + 110;
    ui.title = { x: WIDTH / 2, y: top + 20 };
    ui.score = { x: WIDTH / 2, y: top + 64 };
    var trayY = BOARD_Y + BOARD_PIXELS + 130;
    ui.slots = [0, 1, 2].map(function (i) { return { x: WIDTH / 2 + (i - 1) * 245, y: trayY, halfW: 120, halfH: 110 }; });
    ui.name = { x: WIDTH / 2 - 120, y: trayY + 160 };
    ui.records = { x: WIDTH / 2 + 20, y: trayY + 130, w: 200, h: 60 };
    ui.hint = { x: WIDTH / 2, y: trayY + 230 };
  } else {
    var left = (WIDTH - (BOARD_PIXELS + 54 + 300)) / 2;
    if (RESERVED.h > 100) left = Math.max(left, RESERVED.w + 20);
    var column = left + BOARD_PIXELS + 54 + 150;
    BOARD_X = left;
    BOARD_Y = 110;
    ui.title = { x: BOARD_X + BOARD_PIXELS / 2, y: 40 };
    ui.score = { x: BOARD_X + BOARD_PIXELS / 2, y: 80 };
    ui.slots = [0, 1, 2].map(function (i) { return { x: column, y: 110 + i * 200 + 100, halfW: 150, halfH: 100 }; });
    ui.name = { x: column, y: 24 };
    ui.records = { x: column - 90, y: 44, w: 180, h: 60 };
    ui.hint = { x: column, y: HEIGHT - 30 };
  }
}
onLayout();
var TRAY_CELL = 34;
var LIFT = 110;
var CLEAR_IN_SECONDS = 0.3;
var COLORS = ["#ff6b6b", "#ffa94d", "#fcc419", "#51cf66", "#22b8cf", "#339af0", "#845ef7", "#f06595"];
var SHAPES = [
  [[0, 0]],
  [[0, 0], [0, 1]], [[0, 0], [1, 0]],
  [[0, 0], [0, 1], [0, 2]], [[0, 0], [1, 0], [2, 0]],
  [[0, 0], [0, 1], [0, 2], [0, 3]], [[0, 0], [1, 0], [2, 0], [3, 0]],
  [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]], [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
  [[0, 0], [0, 1], [1, 0], [1, 1]],
  [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
  [[0, 0], [1, 0], [1, 1]], [[0, 1], [1, 0], [1, 1]], [[0, 0], [0, 1], [1, 0]], [[0, 0], [0, 1], [1, 1]],
  [[0, 0], [1, 0], [2, 0], [2, 1]], [[0, 1], [1, 1], [2, 1], [2, 0]], [[0, 0], [0, 1], [1, 0], [2, 0]], [[0, 0], [0, 1], [1, 1], [2, 1]],
  [[0, 0], [0, 1], [0, 2], [1, 1]], [[1, 0], [1, 1], [1, 2], [0, 1]],
  [[0, 0], [0, 1], [1, 1], [1, 2]], [[0, 1], [0, 2], [1, 0], [1, 1]],
  [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0]]
];

var board = [];
var tray = [];
var score = 0;
var best = 0;
var dragging = null;
var clearing = [];
var clearTimer = 0;
var over = false;
var floaters = [];

function emptyBoard() {
  var rows = [];
  for (var r = 0; r < SIZE; r++) { var row = []; for (var c = 0; c < SIZE; c++) row.push(null); rows.push(row); }
  return rows;
}

function randomPiece() {
  return { cells: SHAPES[Math.floor(Math.random() * SHAPES.length)], color: COLORS[Math.floor(Math.random() * COLORS.length)] };
}

function pieceSize(piece) {
  var rows = 0, cols = 0;
  piece.cells.forEach(function (cell) { rows = Math.max(rows, cell[0] + 1); cols = Math.max(cols, cell[1] + 1); });
  return { rows: rows, cols: cols };
}

function fits(piece, row, col) {
  return piece.cells.every(function (cell) {
    var r = row + cell[0], c = col + cell[1];
    return r >= 0 && r < SIZE && c >= 0 && c < SIZE && !board[r][c];
  });
}

function fitsAnywhere(piece) {
  for (var r = 0; r < SIZE; r++) for (var c = 0; c < SIZE; c++) if (fits(piece, r, c)) return true;
  return false;
}

function newTray() {
  tray = [randomPiece(), randomPiece(), randomPiece()];
}

function newGame() {
  board = emptyBoard();
  score = 0;
  over = false;
  clearing = [];
  newTray();
  remember();
}

function remember() {
  playerSave("game", { board: board, tray: tray, score: score });
  playerSave("best", best);
}

function setup() {
  best = playerLoad("best", 0);
  var saved = playerLoad("game", null);
  if (!saved) { newGame(); return; }
  board = saved.board;
  tray = saved.tray;
  score = saved.score;
  checkOver();
}

function checkOver() {
  var left = tray.filter(function (piece) { return piece; });
  over = left.length > 0 && !left.some(fitsAnywhere);
  if (over) sfx("tab");
}

function place(piece, row, col) {
  piece.cells.forEach(function (cell) { board[row + cell[0]][col + cell[1]] = piece.color; });
  score += piece.cells.length;
  var fullRows = [], fullCols = [];
  for (var r = 0; r < SIZE; r++) if (board[r].every(function (cell) { return cell; })) fullRows.push(r);
  for (var c = 0; c < SIZE; c++) {
    var full = true;
    for (var rr = 0; rr < SIZE; rr++) if (!board[rr][c]) full = false;
    if (full) fullCols.push(c);
  }
  var lines = fullRows.length + fullCols.length;
  clearing = [];
  fullRows.forEach(function (r) { for (var c = 0; c < SIZE; c++) clearing.push({ r: r, c: c, color: board[r][c] }); });
  fullCols.forEach(function (c) { for (var r = 0; r < SIZE; r++) clearing.push({ r: r, c: c, color: board[r][c] }); });
  clearing.forEach(function (cell) { board[cell.r][cell.c] = null; });
  if (lines > 0) {
    var bonus = lines * 10 * lines;
    score += bonus;
    clearTimer = CLEAR_IN_SECONDS;
    floaters.push({ words: lines > 1 ? "Kombo x" + lines + "! +" + bonus : "+" + bonus, life: 1.2 });
    sfx(lines > 1 ? "sejr" : "pop");
  } else {
    sfx("klik");
  }
  if (score > best) best = score;
}

function update(dt) {
  if (clearTimer > 0) clearTimer = Math.max(0, clearTimer - dt);
  for (var i = floaters.length - 1; i >= 0; i--) { floaters[i].life -= dt; if (floaters[i].life <= 0) floaters.splice(i, 1); }
}

function block(x, y, size, color) {
  box(x + 2, y + 2, size - 4, size - 4, color);
  box(x + 2, y + 2, size - 4, 6, "rgba(255,255,255,0.3)");
}

function slotCenter(i) { return ui.slots[i]; }

function dropSpot() {
  var piece = dragging.piece;
  var size = pieceSize(piece);
  var left = dragging.x - size.cols * CELL / 2;
  var top = dragging.y - LIFT - size.rows * CELL / 2;
  return { row: Math.round((top - BOARD_Y) / CELL), col: Math.round((left - BOARD_X) / CELL) };
}

function draw() {
  clear("#14204a");
  text("Blok Blast", ui.title.x, ui.title.y, 40, "#ffd43b");
  text("Point: " + score, ui.score.x, ui.score.y, 26);
  text(player().emoji + " " + player().name + "  ·  🏆 " + best, ui.name.x, ui.name.y, 22, "#ffd43b");
  box(ui.records.x, ui.records.y, ui.records.w, ui.records.h, "#5c7cfa");
  text("🏆 Rekorder", ui.records.x + ui.records.w / 2, ui.records.y + ui.records.h / 2, 22);

  box(BOARD_X - 6, BOARD_Y - 6, SIZE * CELL + 12, SIZE * CELL + 12, "#0d1636");
  for (var r = 0; r < SIZE; r++) {
    for (var c = 0; c < SIZE; c++) {
      var x = BOARD_X + c * CELL, y = BOARD_Y + r * CELL;
      if (board[r][c]) block(x, y, CELL, board[r][c]);
      else box(x + 2, y + 2, CELL - 4, CELL - 4, "#24336b");
    }
  }
  if (clearTimer > 0) {
    var grow = (1 - clearTimer / CLEAR_IN_SECONDS) * CELL / 2;
    clearing.forEach(function (cell) {
      box(BOARD_X + cell.c * CELL + grow, BOARD_Y + cell.r * CELL + grow, CELL - grow * 2, CELL - grow * 2, "#ffffff");
    });
  }

  if (dragging) {
    var spot = dropSpot();
    if (fits(dragging.piece, spot.row, spot.col)) {
      dragging.piece.cells.forEach(function (cell) {
        box(BOARD_X + (spot.col + cell[1]) * CELL + 2, BOARD_Y + (spot.row + cell[0]) * CELL + 2, CELL - 4, CELL - 4, "rgba(255,255,255,0.35)");
      });
    }
  }

  tray.forEach(function (piece, i) {
    if (!piece || (dragging && dragging.index === i)) return;
    var size = pieceSize(piece);
    var center = slotCenter(i);
    var usable = fitsAnywhere(piece);
    piece.cells.forEach(function (cell) {
      block(center.x - size.cols * TRAY_CELL / 2 + cell[1] * TRAY_CELL, center.y - size.rows * TRAY_CELL / 2 + cell[0] * TRAY_CELL, TRAY_CELL, usable ? piece.color : "#555c7a");
    });
  });

  if (dragging) {
    var piece = dragging.piece;
    var dragSize = pieceSize(piece);
    piece.cells.forEach(function (cell) {
      block(dragging.x - dragSize.cols * CELL / 2 + cell[1] * CELL, dragging.y - LIFT - dragSize.rows * CELL / 2 + cell[0] * CELL, CELL, piece.color);
    });
  }

  if (floaters.length) text(floaters[0].words, BOARD_X + SIZE * CELL / 2, BOARD_Y + SIZE * CELL / 2, 56, "#ffd43b");
  if (!dragging && score === 0) text("👆 Træk en brik op på brættet", ui.hint.x, ui.hint.y, 18, "#9fb0e8");

  if (over) {
    box(0, 0, WIDTH, HEIGHT, "rgba(0,0,0,0.6)");
    var midY = HEIGHT / 2;
    box(WIDTH / 2 - 250, midY - 160, 500, 320, "#fff8e7");
    text("Ingen plads 😢", WIDTH / 2, midY - 90, 44, "#222");
    text("Point: " + score + "  ·  🏆 " + best, WIDTH / 2, midY - 20, 28, "#444");
    box(WIDTH / 2 - 120, midY + 40, 240, 90, "#2f9e44");
    text("🔁 Nyt spil", WIDTH / 2, midY + 85, 30);
  }
}

function onTap(x, y) {
  if (over) {
    if (Math.abs(x - WIDTH / 2) < 120 && y > HEIGHT / 2 + 40 && y < HEIGHT / 2 + 130) { newGame(); sfx("hop"); }
    return;
  }
  if (x > ui.records.x && x < ui.records.x + ui.records.w && y > ui.records.y && y < ui.records.y + ui.records.h) { showRecords("best", " point"); sfx("klik"); return; }
  for (var i = 0; i < tray.length; i++) {
    var center = slotCenter(i);
    if (tray[i] && Math.abs(x - center.x) < center.halfW && Math.abs(y - center.y) < center.halfH) {
      dragging = { piece: tray[i], index: i, x: x, y: y };
      sfx("klik");
      return;
    }
  }
}

function onDrag(x, y) {
  if (!dragging) return;
  dragging.x = x;
  dragging.y = y;
}

function onRelease() {
  if (!dragging) return;
  var spot = dropSpot();
  var piece = dragging.piece;
  var index = dragging.index;
  dragging = null;
  if (!fits(piece, spot.row, spot.col)) { sfx("bump"); return; }
  place(piece, spot.row, spot.col);
  tray[index] = null;
  if (tray.every(function (p) { return !p; })) newTray();
  checkOver();
  remember();
}
