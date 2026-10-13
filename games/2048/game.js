useFont("rund");
window.USES_PLAYERS = true;
window.HI_RES = true;
window.ADAPTIVE = true;

var SIZE = 4;
var TILE = 124;
var GAP = 14;
var BOARD = SIZE * TILE + (SIZE + 1) * GAP;
var BOARD_X = 0;
var BOARD_Y = 0;
var ui = {};

function onLayout() {
  var portrait = HEIGHT > WIDTH;
  BOARD_X = (WIDTH - BOARD) / 2;
  if (portrait) {
    var top = Math.max(RESERVED.h + 30, (HEIGHT - BOARD - 420) / 2);
    ui.title = { x: WIDTH / 2, y: top + 20 };
    ui.score = { x: BOARD_X, y: top + 60 };
    ui.best = { x: BOARD_X + BOARD - 240, y: top + 60 };
    BOARD_Y = top + 140;
    var below = BOARD_Y + BOARD + 30;
    ui.newGame = { x: WIDTH / 2 - 200, y: below, w: 190, h: 84 };
    ui.records = { x: WIDTH / 2 + 10, y: below, w: 190, h: 84 };
    ui.name = { x: WIDTH / 2, y: below + 130 };
    ui.hint = { x: WIDTH / 2, y: below + 170, oneLine: true };
  } else {
    if (RESERVED.h > 90) BOARD_X = Math.max(BOARD_X, RESERVED.w + 20);
    ui.title = { x: BOARD_X + BOARD / 2, y: 60 };
    ui.score = { x: BOARD_X, y: 92 };
    ui.best = { x: BOARD_X + BOARD - 240, y: 92 };
    BOARD_Y = 160;
    var side = BOARD_X + BOARD + (WIDTH - BOARD_X - BOARD) / 2;
    ui.newGame = { x: side - 95, y: 400, w: 190, h: 84 };
    ui.records = { x: side - 95, y: 500, w: 190, h: 84 };
    ui.name = { x: BOARD_X / 2, y: 300 };
    ui.hint = { x: BOARD_X / 2, y: 420, oneLine: false };
  }
}
onLayout();

function inRect(x, y, r) { return x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h; }
var SLIDE_IN_SECONDS = 0.12;
var SWIPE_MIN = 30;
var WIN_VALUE = 2048;

var COLORS = {
  2: "#ff8787", 4: "#ffa94d", 8: "#ffd43b", 16: "#a9e34b", 32: "#51cf66", 64: "#20c997",
  128: "#22b8cf", 256: "#339af0", 512: "#5c7cfa", 1024: "#845ef7", 2048: "#e64980"
};

var grid = [];
var tiles = [];
var score = 0;
var best = 0;
var sliding = 0;
var swipe = null;
var over = false;
var won = false;
var floaters = [];

function emptyGrid() {
  var rows = [];
  for (var r = 0; r < SIZE; r++) rows.push([null, null, null, null]);
  return rows;
}

function makeTile(row, col, value) {
  var tile = { row: row, col: col, fromRow: row, fromCol: col, value: value, pop: 0.25, dying: false, double: false };
  grid[row][col] = tile;
  tiles.push(tile);
  return tile;
}

function addRandomTile() {
  var free = [];
  for (var r = 0; r < SIZE; r++) for (var c = 0; c < SIZE; c++) if (!grid[r][c]) free.push([r, c]);
  if (free.length === 0) return;
  var spot = free[Math.floor(Math.random() * free.length)];
  makeTile(spot[0], spot[1], Math.random() < 0.9 ? 2 : 4);
}

function newGame() {
  grid = emptyGrid();
  tiles = [];
  score = 0;
  over = false;
  won = false;
  addRandomTile();
  addRandomTile();
  remember();
}

function remember() {
  var values = grid.map(function (row) { return row.map(function (tile) { return tile ? tile.value : 0; }); });
  playerSave("board", { values: values, score: score, won: won });
  playerSave("best", best);
}

function setup() {
  best = playerLoad("best", 0);
  var saved = playerLoad("board", null);
  if (!saved) { newGame(); return; }
  grid = emptyGrid();
  tiles = [];
  score = saved.score;
  won = saved.won;
  saved.values.forEach(function (row, r) { row.forEach(function (value, c) { if (value) makeTile(r, c, value); }); });
  over = !canMove();
}

function canMove() {
  for (var r = 0; r < SIZE; r++) {
    for (var c = 0; c < SIZE; c++) {
      var tile = grid[r][c];
      if (!tile) return true;
      if (c < SIZE - 1 && grid[r][c + 1] && grid[r][c + 1].value === tile.value) return true;
      if (r < SIZE - 1 && grid[r + 1][c] && grid[r + 1][c].value === tile.value) return true;
    }
  }
  return false;
}

function move(dRow, dCol) {
  if (sliding > 0 || over) return;
  tiles.forEach(function (tile) { tile.fromRow = tile.row; tile.fromCol = tile.col; tile.merged = false; });
  var order = [0, 1, 2, 3];
  var rows = dRow > 0 ? order.slice().reverse() : order;
  var cols = dCol > 0 ? order.slice().reverse() : order;
  var moved = false;
  rows.forEach(function (r) {
    cols.forEach(function (c) {
      var tile = grid[r][c];
      if (!tile) return;
      var row = r;
      var col = c;
      while (true) {
        var nextRow = row + dRow;
        var nextCol = col + dCol;
        if (nextRow < 0 || nextRow >= SIZE || nextCol < 0 || nextCol >= SIZE) break;
        var other = grid[nextRow][nextCol];
        if (!other) { row = nextRow; col = nextCol; continue; }
        if (other.value === tile.value && !other.merged) {
          grid[r][c] = null;
          tile.row = nextRow;
          tile.col = nextCol;
          tile.dying = true;
          other.merged = true;
          other.double = true;
          moved = true;
          return;
        }
        break;
      }
      if (row !== r || col !== c) {
        grid[r][c] = null;
        grid[row][col] = tile;
        tile.row = row;
        tile.col = col;
        moved = true;
      }
    });
  });
  if (moved) sliding = SLIDE_IN_SECONDS;
}

function finishMove() {
  var biggestNew = 0;
  tiles = tiles.filter(function (tile) { return !tile.dying; });
  tiles.forEach(function (tile) {
    if (!tile.double) return;
    tile.double = false;
    tile.value *= 2;
    tile.pop = 0.2;
    score += tile.value;
    biggestNew = Math.max(biggestNew, tile.value);
  });
  if (biggestNew > 0) {
    if (biggestNew >= 128) sfx("sejr"); else sfx("pop");
    if (biggestNew === WIN_VALUE && !won) { won = true; floaters.push({ words: "Du klarede 2048! 🎉", life: 3 }); }
  }
  if (score > best) best = score;
  addRandomTile();
  if (!canMove()) { over = true; sfx("tab"); }
  remember();
}

function update(dt) {
  if (sliding > 0) {
    sliding -= dt;
    if (sliding <= 0) { sliding = 0; finishMove(); }
  }
  tiles.forEach(function (tile) { tile.pop = Math.max(0, tile.pop - dt); });
  for (var i = floaters.length - 1; i >= 0; i--) { floaters[i].life -= dt; if (floaters[i].life <= 0) floaters.splice(i, 1); }
}

function cellX(col) { return BOARD_X + GAP + col * (TILE + GAP); }
function cellY(row) { return BOARD_Y + GAP + row * (TILE + GAP); }

function drawTile(tile) {
  var t = sliding > 0 ? 1 - sliding / SLIDE_IN_SECONDS : 1;
  var row = tile.fromRow + (tile.row - tile.fromRow) * t;
  var col = tile.fromCol + (tile.col - tile.fromCol) * t;
  var grow = tile.pop > 0 ? 1 + tile.pop * 0.5 : 1;
  var size = TILE * grow;
  var x = cellX(col) + (TILE - size) / 2;
  var y = cellY(row) + (TILE - size) / 2;
  box(x, y, size, size, COLORS[tile.value] || "#3d2b6b");
  var digits = String(tile.value).length;
  text(String(tile.value), x + size / 2, y + size / 2 + 2, digits <= 2 ? 58 : digits === 3 ? 48 : 38, "#fff");
}

function draw() {
  clear("#2b1f4a");
  text("2048", ui.title.x, ui.title.y, 56, "#ffd43b");
  box(ui.score.x, ui.score.y, 240, 56, "rgba(255,255,255,0.12)");
  text("Point: " + score, ui.score.x + 120, ui.score.y + 28, 26);
  box(ui.best.x, ui.best.y, 240, 56, "rgba(255,255,255,0.12)");
  text("🏆 Rekord: " + best, ui.best.x + 120, ui.best.y + 28, 24);

  box(BOARD_X, BOARD_Y, BOARD, BOARD, "#4a3a78");
  for (var r = 0; r < SIZE; r++) for (var c = 0; c < SIZE; c++) box(cellX(c), cellY(r), TILE, TILE, "#5d4b8f");
  tiles.forEach(function (tile) { if (tile.dying) drawTile(tile); });
  tiles.forEach(function (tile) { if (!tile.dying) drawTile(tile); });

  box(ui.newGame.x, ui.newGame.y, ui.newGame.w, ui.newGame.h, "#e64980");
  text("🔁 Nyt spil", ui.newGame.x + 95, ui.newGame.y + 42, 26);
  box(ui.records.x, ui.records.y, ui.records.w, ui.records.h, "#5c7cfa");
  text("🏆 Rekorder", ui.records.x + 95, ui.records.y + 42, 24);
  text(player().emoji + " " + player().name, ui.name.x, ui.name.y, 24, "#fff");
  if (ui.hint.oneLine) {
    text("👆 Swipe for at flytte brikkerne", ui.hint.x, ui.hint.y, 22, "#cdbfff");
  } else {
    text("👆 Swipe", ui.hint.x, ui.hint.y, 24, "#cdbfff");
    text("for at flytte", ui.hint.x, ui.hint.y + 32, 20, "#cdbfff");
  }

  if (floaters.length) {
    box(WIDTH / 2 - 260, BOARD_Y + BOARD / 2 - 45, 520, 90, "rgba(0,0,0,0.6)");
    text(floaters[0].words, WIDTH / 2, BOARD_Y + BOARD / 2, 40, "#ffd43b");
  }
  if (over) {
    box(BOARD_X, BOARD_Y, BOARD, BOARD, "rgba(0,0,0,0.6)");
    text("Ingen flere træk 😢", WIDTH / 2, BOARD_Y + BOARD / 2 - 40, 40, "#fff");
    text("Tryk på 🔁 Nyt spil", WIDTH / 2, BOARD_Y + BOARD / 2 + 20, 28, "#ffd43b");
  }
}

function onTap(x, y) {
  if (inRect(x, y, ui.newGame)) { newGame(); sfx("hop"); return; }
  if (inRect(x, y, ui.records)) { showRecords("best", " point"); sfx("klik"); return; }
  swipe = { x: x, y: y, done: false };
}

function onDrag(x, y) {
  if (!swipe || swipe.done) return;
  var dx = x - swipe.x;
  var dy = y - swipe.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN) return;
  swipe.done = true;
  if (Math.abs(dx) > Math.abs(dy)) move(0, dx > 0 ? 1 : -1);
  else move(dy > 0 ? 1 : -1, 0);
}

function onRelease(x, y) {
  if (swipe && !swipe.done) onDrag(x, y);
  swipe = null;
}
