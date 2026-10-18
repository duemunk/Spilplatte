useFont("rund");
window.HI_RES = true;
window.ADAPTIVE = true;
window.USES_PLAYERS = true;

var MAP = [
  "##############################################",
  "##############################################",
  "##aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa##",
  "##aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa##",
  "##aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa##",
  "##aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa##",
  "##aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa##",
  "##aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa##",
  "##aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa##",
  "##aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa##",
  "##aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa##",
  "##aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa##",
  "##aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa##",
  "##aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa##",
  "##aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa##",
  "##aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa##",
  "##aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa##",
  "##aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa##",
  "##aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa##",
  "##aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa##",
  "##aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa##",
  "##############ddd####dddddddd#################",
  "##############ddd####dddddddd#################",
  "##bbbbbbbbbbbbbbbbbb#dddddddd##ccccccccccccc##",
  "##bbbbbbbbbbbbbbbbbb#dddddddd##ccccccccccccc##",
  "##bbbbbbbbbbbbbbbbbb#dddddddd##ccccccccccccc##",
  "##bbbbbbbbbbbbbbbbbb#dddddddd##ccccccccccccc##",
  "##bbbbbbbbbbbbbbbbbb#dddddddd##ccccccccccccc##",
  "##bbbbbbbbbbbbbbbbbb#dddddddd##ccccccccccccc##",
  "##bbbbbbbbbbbbbbbbbb#dddddddd##ccccccccccccc##",
  "##bbbbbbbbbbbbbbbbbb#dddddddd##ccccccccccccc##",
  "##bbbbbbbbbbbbbbbbbb#ddddddddddccccccccccccc##",
  "##bbbbbbbbbbbbbbbbbb#ddddddddddccccccccccccc##",
  "##bbbbbbbbbbbbbbbbbb#ddddddddddccccccccccccc##",
  "##bbbbbbbbbbbbbbbbbb#ddddddddddccccccccccccc##",
  "##bbbbbbbbbbbbbbbbbb#dddddddd##ccccccccccccc##",
  "##bbbbbbbbbbbbbbbbbb#dddddddd##ccccccccccccc##",
  "##bbbbbbbbbbbbbbbbbb#dddddddd##ccccccccccccc##",
  "##dddd###############dddddddd##ccccccccccccc##",
  "##dddd###############dddddddd#################",
  "##ddddddddddddddddddddddddddd#################",
  "##ddddddddddddddddddddddddddffffffffffffffff##",
  "##ddddddddddddddddddddddddddffffffffffffffff##",
  "##ddddddddddddddddddddddddddffffffffffffffff##",
  "##dddddddddddddddddddddddd##ffffffffffffffff##",
  "##dddddddddddddddddddddddd##ffffffffffffffff##",
  "##dddddddddddddddddddddddd##ffffffffffffffff##",
  "##dddddddddddddddddddddddd##ffffffffffffffff##",
  "##dddd######################ffffffffffffffff##",
  "##dddd######################ffffffffffffffff##",
  "##eeeeeeeeeeeeeeeeeeeeeeee##ffffffffffffffff##",
  "##eeeeeeeeeeeeeeeeeeeeeeee##ffffffffffffffff##",
  "##eeeeeeeeeeeeeeeeeeeeeeee##ffffffffffffffff##",
  "##eeeeeeeeeeeeeeeeeeeeeeee##ffffffffffffffff##",
  "##eeeeeeeeeeeeeeeeeeeeeeee##ffffffffffffffff##",
  "##eeeeeeeeeeeeeeeeeeeeeeee##ffffffffffffffff##",
  "##eeeeeeeeeeeeeeeeeeeeeeee##ffffffffffffffff##",
  "##eeeeeeeeeeeeeeeeeeeeeeee##ffffffffffffffff##",
  "##eeeeeeeeeeeeeeeeeeeeeeee##ffffffffffffffff##",
  "##eeeeeeeeeeeeeeeeeeeeeeee##ffffffffffffffff##",
  "##eeeeeeeeeeeeeeeeeeeeeeee##ffffffffffffffff##",
  "##eeeeeeeeeeeeeeeeeeeeeeee##ffffffffffffffff##",
  "##eeeeeeeeeeeeeeeeeeeeeeee##ffffffffffffffff##",
  "##eeeeeeeeeeeeeeeeeeeeeeee##ffffffffffffffff##",
  "##eeeeeeeeeeeeeeeeeeeeeeee##ffffffffffffffff##",
  "##eeeeeeeeeeeeeeeeeeeeeeee##ffffffffffffffff##",
  "##############################################",
  "##############################################"
];
var PROPS = [
  { emoji: "🛋️", col: 31, row: 12 },
  { emoji: "📺", col: 6, row: 8 },
  { emoji: "🎱", col: 15, row: 5 },
  { emoji: "📦", col: 8, row: 26 },
  { emoji: "📦", col: 15, row: 34 },
  { emoji: "🧳", col: 5, row: 35 },
  { emoji: "🧺", col: 33, row: 31 },
  { emoji: "🧴", col: 40, row: 25 },
  { emoji: "💻", col: 15, row: 62 },
  { emoji: "📚", col: 8, row: 59 },
  { emoji: "🖨️", col: 15, row: 53 },
  { emoji: "🛠️", col: 32, row: 63 },
  { emoji: "🔧", col: 39, row: 47 },
  { emoji: "🔨", col: 35, row: 56 }
];

var TILE = 56;
var ROWS = MAP.length;
var COLS = MAP[0].length;
var WORLD_W = COLS * TILE;
var WORLD_H = ROWS * TILE;
var SPEED = 320;
var RADIUS = 18;
var DIAMOND_VALUE = 5;
var GOLD_VALUE = 1;
var HINT_AFTER_SECONDS = 20;
var REVEAL_DISTANCE = 140;
var DETECTOR_RANGE = 520;
var detectorTimer = 0;
var DIGS_NEEDED = 3;
var DIG_REACH = 70;
var MAX_HOLES = 40;
var holes = [];
var scene = "basement";
var portal = null;
var strength = 0;
var STRENGTH_PER_LEVEL = 3;
var TAPS_PER_SET = 12;
var STATIONS = [
  { emoji: "🏋️", name: "Vægte", color: "#e8590c" },
  { emoji: "🚴", name: "Cykel", color: "#1c7ed6" },
  { emoji: "🤸", name: "Gymnastik", color: "#2f9e44" }
];
var stationTaps = [0, 0, 0];
var flex = 0;

function digsNeeded() { return Math.max(1, DIGS_NEEDED - Math.floor(strength / STRENGTH_PER_LEVEL)); }
var dirt = [];
var FLOOR_COLORS = { a: "#cdb592", b: "#b5ada6", c: "#cfe3f0", d: "#d9c4a3", e: "#e6d3b8", f: "#bfae99" };
var WALL = "#4a4a55";
var WALL_TOP = "#6b6b78";

var hero = { x: 0, y: 0 };
var steering = null;
var camera = { x: 0, y: 0 };
var treasures = [];
var round = 1;
var found = 0;
var roundTime = 0;
var sinceFind = 0;
var total = 0;
var done = false;
var floaters = [];
var sparkle = 0;

function solid(col, row) {
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return true;
  return MAP[row].charAt(col) === "#";
}

function blockedAt(x, y) {
  return solid(Math.floor((x - RADIUS) / TILE), Math.floor((y - RADIUS) / TILE)) ||
    solid(Math.floor((x + RADIUS) / TILE), Math.floor((y - RADIUS) / TILE)) ||
    solid(Math.floor((x - RADIUS) / TILE), Math.floor((y + RADIUS) / TILE)) ||
    solid(Math.floor((x + RADIUS) / TILE), Math.floor((y + RADIUS) / TILE));
}

function startTile() {
  for (var row = ROWS - 1; row >= 0; row--) {
    for (var col = 0; col < COLS; col++) {
      if (MAP[row].charAt(col) === "d" && !solid(col - 1, row) && !solid(col + 1, row) && !solid(col, row - 1) && !solid(col, row + 1) && row > 40 && row < 50) return { col: col + 2, row: row };
    }
  }
  return { col: 10, row: 44 };
}

function startRound() {
  var start = startTile();
  hero.x = start.col * TILE + TILE / 2;
  hero.y = start.row * TILE + TILE / 2;
  treasures = [];
  var count = Math.min(30, 8 + round * 2);
  var taken = {};
  PROPS.forEach(function (p) { taken[p.col + "," + p.row] = true; });
  var tries = 0;
  while (treasures.length < count && tries++ < 5000) {
    var col = Math.floor(Math.random() * COLS);
    var row = Math.floor(Math.random() * ROWS);
    if (solid(col, row) || taken[col + "," + row]) continue;
    if (Math.abs(col - start.col) + Math.abs(row - start.row) < 4) continue;
    taken[col + "," + row] = true;
    treasures.push({ x: col * TILE + TILE / 2, y: row * TILE + TILE / 2, diamond: treasures.length % 3 === 0, phase: Math.random() * 6, seen: false, digs: 0 });
  }
  holes = [];
  dirt = [];
  found = 0;
  roundTime = 0;
  sinceFind = 0;
  done = false;
}

function setup() {
  round = playerLoad("round", 1);
  total = playerLoad("total", 0);
  strength = playerLoad("strength", 0);
  startRound();
}

function update(dt) {
  sparkle += dt;
  for (var f = floaters.length - 1; f >= 0; f--) {
    floaters[f].life -= dt;
    floaters[f].y -= 50 * dt;
    if (floaters[f].life <= 0) floaters.splice(f, 1);
  }
  for (var q = dirt.length - 1; q >= 0; q--) {
    dirt[q].life -= dt;
    dirt[q].x += dirt[q].vx * dt;
    dirt[q].y += dirt[q].vy * dt;
    dirt[q].vy += 700 * dt;
    if (dirt[q].life <= 0) dirt.splice(q, 1);
  }
  flex = Math.max(0, flex - dt);
  if (done || scene === "gym") return;
  roundTime += dt;
  sinceFind += dt;
  if (steering) {
    var tx = steering.x + camera.x, ty = steering.y + camera.y;
    var dx = tx - hero.x, dy = ty - hero.y;
    var length = Math.sqrt(dx * dx + dy * dy);
    if (length > 12) {
      var step = Math.min(length, SPEED * dt);
      var nx = hero.x + dx / length * step;
      var ny = hero.y + dy / length * step;
      if (!blockedAt(nx, hero.y)) hero.x = nx;
      if (!blockedAt(hero.x, ny)) hero.y = ny;
    }
  }
  // Treasures are hidden until you are close. A detector beeps faster the closer you get.
  var nearestHidden = Infinity;
  treasures.forEach(function (t) {
    var d = distance(t.x, t.y, hero.x, hero.y);
    if (!t.seen && d < REVEAL_DISTANCE) { t.seen = true; sfx("pop"); floaters.push({ words: "Fundet! 👀", x: t.x, y: t.y - 40, life: 0.9 }); }
    if (!t.seen) nearestHidden = Math.min(nearestHidden, d);
  });
  detectorTimer -= dt;
  if (nearestHidden < DETECTOR_RANGE && detectorTimer <= 0) {
    beep(500 + (1 - nearestHidden / DETECTOR_RANGE) * 700, 0.05);
    detectorTimer = 0.15 + (nearestHidden / DETECTOR_RANGE) * 1.1;
  }
  if (portal && portal.pull !== undefined) {
    portal.pull -= dt;
    hero.x += (portal.x - hero.x) * Math.min(1, dt * 8);
    hero.y += (portal.y - hero.y) * Math.min(1, dt * 8);
    if (portal.pull <= 0) { delete portal.pull; scene = "gym"; sfx("boing"); }
  } else if (portal && distance(portal.x, portal.y, hero.x, hero.y) < 45) { scene = "gym"; steering = null; sfx("boing"); }
  camera.x = WORLD_W <= WIDTH ? (WORLD_W - WIDTH) / 2 : Math.max(0, Math.min(WORLD_W - WIDTH, hero.x - WIDTH / 2));
  camera.y = WORLD_H <= HEIGHT ? (WORLD_H - HEIGHT) / 2 : Math.max(0, Math.min(WORLD_H - HEIGHT, hero.y - HEIGHT / 2));
}

function collect(t) {
  var value = t.diamond ? DIAMOND_VALUE : GOLD_VALUE;
  total += value;
  found++;
  sinceFind = 0;
  floaters.push({ words: t.diamond ? "+5 💎" : "+1", x: t.x, y: t.y - 40, life: 1 });
  treasures.splice(treasures.indexOf(t), 1);
  sfx(t.diamond ? "hop" : "mont");
  playerSave("total", total);
  if (treasures.length === 0) {
    done = true;
    round++;
    playerSave("round", round);
    setTimeout(function () { sfx("sejr"); }, 200);
  }
}

// Dig where you stand: three digs bring a buried treasure up; an empty spot leaves a hole.
function dig() {
  for (var k = 0; k < 6; k++) dirt.push({ x: hero.x + random(-10, 10), y: hero.y + 20, vx: random(-140, 140), vy: random(-260, -120), life: 0.5 });
  var target = null;
  treasures.forEach(function (t) { var d = distance(t.x, t.y, hero.x, hero.y); if (d < DIG_REACH && (!target || d < target.d)) target = { t: t, d: d }; });
  if (!target) {
    sfx("bump");
    holes.push({ x: hero.x, y: hero.y + 16 });
    if (holes.length > MAX_HOLES) holes.shift();
    floaters.push({ words: "Ingenting her 🤷", x: hero.x, y: hero.y - 50, life: 0.9 });
    return;
  }
  var t = target.t;
  t.seen = true;
  t.digs++;
  sfx("hammer");
  if (t.digs >= digsNeeded()) { holes.push({ x: t.x, y: t.y }); collect(t); }
}

function portalButton() { return { x: 20, y: HEIGHT - 200, w: 180, h: 180 }; }

function openPortal() {
  var spots = [[90, 0], [-90, 0], [0, 90], [0, -90]];
  for (var i = 0; i < spots.length; i++) {
    var px = hero.x + spots[i][0], py = hero.y + spots[i][1];
    if (!blockedAt(px, py)) { portal = { x: px, y: py }; sfx("laser"); return; }
  }
  sfx("bump");
}

function drawPortal(x, y, size) {
  var colors = ["#7048e8", "#9775fa", "#4dabf7", "#d0bfff"];
  for (var i = 0; i < 4; i++) circle(x, y, size * (1 - i * 0.22) * (1 + 0.06 * Math.sin(sparkle * 6 + i)), colors[(i + Math.floor(sparkle * 4)) % 4]);
}

function stationRect(i) {
  var portrait = HEIGHT > WIDTH;
  var w = portrait ? WIDTH - 80 : 280, h = portrait ? 220 : 320;
  var top = Math.max(RESERVED.h + 140, portrait ? 300 : 220);
  return portrait ? { x: 40, y: top + i * (h + 20), w: w, h: h } : { x: WIDTH / 2 - 450 + i * 310, y: top, w: w, h: h };
}

function backButton() { return { x: WIDTH / 2 - 180, y: HEIGHT - 130, w: 360, h: 100 }; }

function drawGym() {
  clear("#2b2d42");
  for (var y = 0; y < HEIGHT; y += 80) box(0, y, WIDTH, 40, "rgba(255,255,255,0.03)");
  var top = Math.max(RESERVED.h + 20, 30);
  text("💪 Fitnesscenter", WIDTH / 2, top + 20, 44, "#ffd43b");
  text("Styrke: " + strength + "  ·  Du graver med " + digsNeeded() + " slag ⛏️", WIDTH / 2, top + 75, 26, "#fff");
  var toNext = STRENGTH_PER_LEVEL - (strength % STRENGTH_PER_LEVEL);
  text(digsNeeded() > 1 ? "Træn " + toNext + " gang" + (toNext > 1 ? "e" : "") + " mere for at grave hurtigere" : "Du er SUPER stærk! 🦾", WIDTH / 2, top + 110, 20, "#cfd3dc");
  STATIONS.forEach(function (st, i) {
    var r = stationRect(i);
    box(r.x, r.y + 6, r.w, r.h, "rgba(0,0,0,0.3)");
    box(r.x, r.y, r.w, r.h, st.color);
    var bounce = stationTaps[i] % 2 ? -10 : 0;
    emoji(st.emoji, r.x + r.w / 2, r.y + r.h * 0.38 + bounce, Math.min(110, r.h * 0.45));
    text(st.name, r.x + r.w / 2, r.y + r.h * 0.7, 26);
    box(r.x + 20, r.y + r.h - 34, r.w - 40, 16, "rgba(0,0,0,0.3)");
    box(r.x + 20, r.y + r.h - 34, (r.w - 40) * stationTaps[i] / TAPS_PER_SET, 16, "#ffd43b");
  });
  if (flex > 0) emoji("💪", WIDTH / 2, HEIGHT / 2, 120 + flex * 80);
  var back = backButton();
  box(back.x, back.y + 6, back.w, back.h, "rgba(0,0,0,0.3)");
  box(back.x, back.y, back.w, back.h, "#7048e8");
  text("🌀 Tilbage til kælderen", back.x + back.w / 2, back.y + back.h / 2, 26);
  text("👆 Tryk hurtigt på en maskine for at træne", WIDTH / 2, back.y - 30, 20, "#cfd3dc");
}

function tapGym(x, y) {
  var back = backButton();
  if (x > back.x && x < back.x + back.w && y > back.y && y < back.y + back.h) {
    scene = "basement";
    if (portal) { hero.x = portal.x + 70; hero.y = portal.y; if (blockedAt(hero.x, hero.y)) { hero.x = portal.x; hero.y = portal.y + 70; } }
    portal = null;
    sfx("boing");
    return;
  }
  STATIONS.forEach(function (st, i) {
    var r = stationRect(i);
    if (x < r.x || x > r.x + r.w || y < r.y || y > r.y + r.h) return;
    stationTaps[i]++;
    sfx("klik");
    if (stationTaps[i] >= TAPS_PER_SET) {
      stationTaps[i] = 0;
      var before = digsNeeded();
      strength++;
      playerSave("strength", strength);
      flex = 0.8;
      sfx(digsNeeded() < before ? "sejr" : "hop");
    }
  });
}

function digButton() {
  return { x: WIDTH - 200, y: HEIGHT - 200, w: 180, h: 180 };
}

function drawGold(x, y) {
  ctx.fillStyle = "#c99a06";
  ctx.beginPath();
  ctx.moveTo(x - 20, y + 10);
  ctx.lineTo(x + 20, y + 10);
  ctx.lineTo(x + 13, y - 8);
  ctx.lineTo(x - 13, y - 8);
  ctx.closePath();
  ctx.fill();
  box(x - 10, y - 6, 20, 5, "#ffe066");
}

// The map is drawn as strips: each run of identical tiles in a row is one rectangle, and the
// tile grid is a few full-length lines. This keeps the old iPad Air to ~100 fills per frame.
var ROW_RUNS = MAP.map(function (line, row) {
  var runs = [];
  for (var col = 0; col < COLS;) {
    var ch = line.charAt(col), end = col;
    while (end + 1 < COLS && line.charAt(end + 1) === ch) end++;
    runs.push({ start: col, end: end, ch: ch });
    col = end + 1;
  }
  return runs;
});
var EDGE_RUNS = MAP.map(function (line, row) {
  var runs = [];
  if (row + 1 >= ROWS) return runs;
  var below = MAP[row + 1];
  for (var col = 0; col < COLS;) {
    var edge = line.charAt(col) === "#" && below.charAt(col) !== "#";
    var end = col;
    while (end + 1 < COLS && (line.charAt(end + 1) === "#" && below.charAt(end + 1) !== "#") === edge) end++;
    if (edge) runs.push({ start: col, end: end });
    col = end + 1;
  }
  return runs;
});

function drawMap() {
  var c0 = Math.max(0, Math.floor(camera.x / TILE)), c1 = Math.min(COLS - 1, Math.floor((camera.x + WIDTH) / TILE));
  var r0 = Math.max(0, Math.floor(camera.y / TILE)), r1 = Math.min(ROWS - 1, Math.floor((camera.y + HEIGHT) / TILE));
  for (var row = r0; row <= r1; row++) {
    var y = row * TILE;
    ROW_RUNS[row].forEach(function (run) {
      if (run.end < c0 || run.start > c1) return;
      var a = Math.max(run.start, c0), b = Math.min(run.end, c1);
      box(a * TILE, y, (b - a + 1) * TILE, TILE, run.ch === "#" ? WALL : FLOOR_COLORS[run.ch] || "#d9c4a3");
    });
    EDGE_RUNS[row].forEach(function (run) {
      if (run.end < c0 || run.start > c1) return;
      var a = Math.max(run.start, c0), b = Math.min(run.end, c1);
      box(a * TILE, y + TILE - 10, (b - a + 1) * TILE, 10, WALL_TOP);
    });
  }
  var left = c0 * TILE, right = (c1 + 1) * TILE, top = r0 * TILE, bottom = (r1 + 1) * TILE;
  for (var gy = top; gy <= bottom; gy += TILE) box(left, gy, right - left, 1, "rgba(0,0,0,0.07)");
  for (var gx = left; gx <= right; gx += TILE) box(gx, top, 1, bottom - top, "rgba(0,0,0,0.07)");
}

function drawHint() {
  if (sinceFind < HINT_AFTER_SECONDS || treasures.length === 0) return;
  var nearest = null;
  treasures.forEach(function (t) { var d = distance(t.x, t.y, hero.x, hero.y); if (!nearest || d < nearest.d) nearest = { t: t, d: d }; });
  if (nearest.d < 150) return;
  var angle = Math.atan2(nearest.t.y - hero.y, nearest.t.x - hero.x);
  ctx.save();
  ctx.translate(hero.x + Math.cos(angle) * 70, hero.y + Math.sin(angle) * 70);
  ctx.rotate(angle);
  ctx.fillStyle = "#ffd43b";
  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.lineTo(-10, -14);
  ctx.lineTo(-10, 14);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function clock(seconds) {
  var s = Math.floor(seconds);
  return Math.floor(s / 60) + ":" + (s % 60 < 10 ? "0" : "") + (s % 60);
}

function draw() {
  if (scene === "gym") { drawGym(); return; }
  box(0, 0, WIDTH, HEIGHT, WALL);
  ctx.save();
  ctx.translate(-Math.round(camera.x), -Math.round(camera.y));
  drawMap();
  PROPS.forEach(function (p) {
    var px = p.col * TILE + TILE / 2, py = p.row * TILE + TILE / 2;
    if (px > camera.x - 60 && px < camera.x + WIDTH + 60 && py > camera.y - 60 && py < camera.y + HEIGHT + 60) emoji(p.emoji, px, py, 70);
  });
  holes.forEach(function (h) { circle(h.x, h.y, 20, "#6b4f3a"); circle(h.x, h.y + 3, 14, "#3e2c20"); });
  treasures.forEach(function (t) {
    if (!t.seen) return;
    var mound = 1 - t.digs / digsNeeded();
    circle(t.x, t.y + 6, 14 + mound * 16, "#8d6e4f");
    circle(t.x - 4, t.y + 2, 6 + mound * 8, "#a1846a");
    var peek = t.digs > 0;
    if (peek) {
      if (t.diamond) emoji("💎", t.x, t.y - 4, 22 + t.digs * 6);
      else drawGold(t.x, t.y);
    } else {
      text("❌", t.x, t.y - 2, 22);
    }
    if (Math.sin(sparkle * 5 + t.phase) > 0.85) emoji("✨", t.x + 16, t.y - 18, 22);
  });
  dirt.forEach(function (d) { box(d.x - 4, d.y - 4, 8, 8, "#7a5a3f"); });
  var closest = Infinity;
  treasures.forEach(function (t) { if (!t.seen) closest = Math.min(closest, distance(t.x, t.y, hero.x, hero.y)); });
  if (closest < DETECTOR_RANGE) {
    var heat = 1 - closest / DETECTOR_RANGE;
    circle(hero.x, hero.y, 36 + heat * 20, "rgba(255,212,59," + (0.15 + heat * 0.35).toFixed(2) + ")");
  }
  if (portal) drawPortal(portal.x, portal.y, portal.pull !== undefined ? 46 + (0.7 - portal.pull) * 60 : 46);
  emoji("🧒", hero.x, hero.y, 50);
  drawHint();
  floaters.forEach(function (f) { text(f.words, f.x, f.y, 28, "#fff"); });
  ctx.restore();

  var top = WIDTH / 2 - 230 < RESERVED.w ? RESERVED.h + 10 : 12;
  box(WIDTH / 2 - 230, top, 460, 56, "rgba(0,0,0,0.45)");
  text("Runde " + round + " · " + found + "/" + (found + treasures.length) + " · ⏱️ " + clock(roundTime), WIDTH / 2, top + 28, 24);
  box(WIDTH - 230, top + 66, 210, 50, "rgba(0,0,0,0.45)");
  text(player().emoji + " 💰 " + total, WIDTH - 125, top + 91, 24, "#ffd43b");
  box(WIDTH - 230, top + 126, 210, 64, "#5c7cfa");
  text("🏆 Rekorder", WIDTH - 125, top + 158, 22);
  var pb = portalButton();
  circle(pb.x + pb.w / 2, pb.y + pb.h / 2 + 6, pb.w / 2, "rgba(0,0,0,0.3)");
  circle(pb.x + pb.w / 2, pb.y + pb.h / 2, pb.w / 2, portal ? "#9775fa" : "#7048e8");
  text("🌀", pb.x + pb.w / 2, pb.y + pb.h / 2 - 16, 56);
  text("Træning", pb.x + pb.w / 2, pb.y + pb.h / 2 + 44, 24);
  var b = digButton();
  var onMound = treasures.some(function (t) { return t.seen && distance(t.x, t.y, hero.x, hero.y) < DIG_REACH; });
  circle(b.x + b.w / 2, b.y + b.h / 2 + 6, b.w / 2, "rgba(0,0,0,0.3)");
  circle(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, onMound ? "#e8590c" : "#8d6e4f");
  text("⛏️", b.x + b.w / 2, b.y + b.h / 2 - 16, 56);
  text("Grav", b.x + b.w / 2, b.y + b.h / 2 + 44, 26);
  if (!steering && found === 0 && roundTime < 8) {
    text("👆 Hold fingeren der, hvor du vil gå hen", WIDTH / 2, HEIGHT - 260, 24, "#fff");
    text("🔊 Bip = skat i nærheden · ❌ = grav her med ⛏️", WIDTH / 2, HEIGHT - 225, 20, "#ffe066");
  }

  if (done) {
    var cx = WIDTH / 2, cy = HEIGHT / 2;
    box(0, 0, WIDTH, HEIGHT, "rgba(0,0,0,0.5)");
    box(cx - 260, cy - 170, 520, 340, "#fff8e7");
    text("Du fandt alle skattene! 🎉", cx, cy - 100, 34, "#222");
    text("⏱️ " + clock(roundTime) + "  ·  💰 " + total, cx, cy - 30, 30, "#b8860b");
    box(cx - 150, cy + 40, 300, 90, "#2f9e44");
    text("Næste runde ▶", cx, cy + 85, 32);
  }
}

function onTap(x, y) {
  if (scene === "gym") { tapGym(x, y); return; }
  if (done) {
    if (Math.abs(x - WIDTH / 2) < 150 && y > HEIGHT / 2 + 40 && y < HEIGHT / 2 + 130) { startRound(); sfx("klik"); }
    return;
  }
  var top = WIDTH / 2 - 230 < RESERVED.w ? RESERVED.h + 10 : 12;
  if (x > WIDTH - 230 && x < WIDTH - 20 && y > top + 126 && y < top + 190) { showRecords("total", " 💰"); sfx("klik"); return; }
  var b = digButton();
  if (distance(x, y, b.x + b.w / 2, b.y + b.h / 2) < b.w / 2) { dig(); return; }
  var pb = portalButton();
  if (distance(x, y, pb.x + pb.w / 2, pb.y + pb.h / 2) < pb.w / 2) {
    if (!portal) openPortal();
    if (portal) { portal.pull = 0.7; steering = null; }
    return;
  }
  steering = { x: x, y: y };
}

function onDrag(x, y) { if (steering) { steering.x = x; steering.y = y; } }
function onRelease() { steering = null; }
