useFont("rund");

var theme = { sea: "#1ea7c9", sand: "#f5e1a4", grass: "#8fd16a", text: "#fff" };

var ISLAND = { x: 512, y: 384, sandX: 422, sandY: 314, grassX: 362, grassY: 264 };
var PLAYER_SPEED = 300;
var VISITOR_SPEED = 150;
var COIN_VALUE_IN_KR = 2;
var MAX_COINS = 9;
var COIN_INTERVAL_IN_SECONDS = 1.4;
var PLOT_WIDTH = 150;
var PLOT_HEIGHT = 120;
var PIER = { x: 512, y: 705 };

var BUILDINGS = {
  hus: { name: "Mit hus", sign: "🏠", priceInKr: 30, roof: "#c0392b", items: [] },
  hospital: {
    name: "Dyrehospital", sign: "🐾", priceInKr: 40, roof: "#4dabf7",
    items: [
      { emoji: "💊", name: "medicin", priceInKr: 8 },
      { emoji: "🌡️", name: "et termometer", priceInKr: 7 },
      { emoji: "🥕", name: "noget mad", priceInKr: 6 },
      { emoji: "❤️", name: "et kram", priceInKr: 5 }
    ]
  },
  bageri: {
    name: "Kagebageri", sign: "🧁", priceInKr: 30, roof: "#f783ac",
    items: [
      { emoji: "🧁", name: "en cupcake", priceInKr: 6 },
      { emoji: "🍰", name: "et stykke kage", priceInKr: 7 },
      { emoji: "🍩", name: "en donut", priceInKr: 5 },
      { emoji: "🍪", name: "en småkage", priceInKr: 5 }
    ]
  },
  stald: {
    name: "Hestestald", sign: "🐴", priceInKr: 50, roof: "#b07d48",
    items: [
      { emoji: "🐴", name: "en ridetur", priceInKr: 10 },
      { emoji: "🥕", name: "en gulerod til hesten", priceInKr: 6 },
      { emoji: "🍎", name: "et æble til hesten", priceInKr: 6 },
      { emoji: "💧", name: "vand til hesten", priceInKr: 5 }
    ]
  }
};
var BUILD_ORDER = ["hus", "hospital", "bageri", "stald"];
var FURNITURE = {
  seng: { emoji: "🛏️", name: "Seng", priceInKr: 15, words: "Zzz… godnat 😴", sound: "klik" },
  sofa: { emoji: "🛋️", name: "Sofa", priceInKr: 15, words: "Hygge! 😊", sound: "klik" },
  fjernsyn: { emoji: "📺", name: "Fjernsyn", priceInKr: 20, words: "Tegnefilm! 📺", sound: "klik" },
  toilet: { emoji: "🚽", name: "Toilet", priceInKr: 10, words: "Ahh, det var godt! 😌", sound: "pop" },
  badekar: { emoji: "🛁", name: "Badekar", priceInKr: 20, words: "Plask plask! 💦", sound: "boing" },
  kokken: { emoji: "🍳", name: "Køkken", priceInKr: 25, words: "", sound: "hop" },
  service: { emoji: "🍽️", name: "Service", priceInKr: 5, words: "Gafler og knive 🍴", sound: "klik" },
  blomst: { emoji: "🌺", name: "Blomst", priceInKr: 5, words: "Den dufter godt 🌸", sound: "klik" }
};
var FURNITURE_ORDER = ["seng", "sofa", "fjernsyn", "toilet", "badekar", "kokken", "service", "blomst"];
var DISHES = ["🍝", "🍕", "🥞", "🍲", "🌮", "🥗", "🍍"];
var FLOOR_TOP = 290;
var FLOOR_BOTTOM = 640;
var VISITOR_FACES = ["👩", "👨", "👵", "👴", "👦", "👧", "🧔", "👱‍♀️"];
var SICK_ANIMALS = ["🐶", "🐱", "🐰", "🐹", "🐦", "🐢"];

var plots = [
  { x: 240, y: 215 }, { x: 437, y: 175 }, { x: 634, y: 215 }, { x: 330, y: 420 }, { x: 560, y: 420 }
];
var palms = [
  { x: 175, y: 410 }, { x: 225, y: 210 }, { x: 860, y: 380 }, { x: 815, y: 180 }, { x: 520, y: 600 },
  { x: 330, y: 590 }, { x: 735, y: 590 }, { x: 512, y: 130 }
];

var player = { x: 512, y: 370, targetX: 512, targetY: 370 };
var money = 0;
var buildings = [];
var visitors = [];
var coins = [];
var floaters = [];
var coinTimer = 0;
var menu = null;
var speech = null;
var scene = "island";
var home = null;
var islandSpot = null;
var dragging = null;
var pendingAction = null;
var cooking = 0;

function setup() {
  var saved = load("state", null);
  if (saved) { money = saved.money; buildings = saved.buildings; }
  buildings.forEach(function (building) {
    building.wait = random(3, 7);
    if (building.type === "hus") building.furniture = building.furniture || [];
  });
  for (var i = 0; i < 4; i++) addCoin();
}

function remember() {
  save("state", {
    money: money,
    buildings: buildings.map(function (b) {
      return b.type === "hus" ? { plot: b.plot, type: b.type, furniture: b.furniture } : { plot: b.plot, type: b.type };
    })
  });
}

function onIsland(x, y, radiusX, radiusY) {
  var dx = (x - ISLAND.x) / radiusX;
  var dy = (y - ISLAND.y) / radiusY;
  return dx * dx + dy * dy < 1;
}

function plotAt(x, y) {
  for (var i = 0; i < plots.length; i++) {
    var p = plots[i];
    if (x > p.x && x < p.x + PLOT_WIDTH && y > p.y && y < p.y + PLOT_HEIGHT) return i;
  }
  return -1;
}

function buildingOn(index) {
  for (var i = 0; i < buildings.length; i++) if (buildings[i].plot === index) return buildings[i];
  return null;
}

function visitorAt(building) {
  for (var i = 0; i < visitors.length; i++) if (visitors[i].building === building && visitors[i].state !== "leaving") return visitors[i];
  return null;
}

function addCoin() {
  for (var tries = 0; tries < 30; tries++) {
    var x = random(150, 874);
    var y = random(110, 660);
    if (onIsland(x, y, ISLAND.sandX - 30, ISLAND.sandY - 30) && plotAt(x, y) === -1) { coins.push({ x: x, y: y }); return; }
  }
}

function float(words, x, y, color) {
  floaters.push({ words: words, x: x, y: y, color: color, life: 1.4 });
}

function say(words) {
  speech = { words: words, life: 2.2, width: 0 };
}

function moveToward(thing, targetX, targetY, speed, dt) {
  var dx = targetX - thing.x;
  var dy = targetY - thing.y;
  var length = Math.sqrt(dx * dx + dy * dy);
  if (length < 4) return true;
  var step = Math.min(length, speed * dt);
  thing.x += dx / length * step;
  thing.y += dy / length * step;
  return false;
}

function frontOf(building) {
  var plot = plots[building.plot];
  return { x: plot.x + PLOT_WIDTH / 2, y: plot.y + PLOT_HEIGHT + 34 };
}

function update(dt) {
  for (var f = floaters.length - 1; f >= 0; f--) {
    floaters[f].life -= dt;
    floaters[f].y -= 40 * dt;
    if (floaters[f].life <= 0) floaters.splice(f, 1);
  }
  if (speech) { speech.life -= dt; if (speech.life <= 0) speech = null; }
  if (menu) return;
  if (scene === "inside") { updateInside(dt); return; }

  moveToward(player, player.targetX, player.targetY, PLAYER_SPEED, dt);

  for (var i = coins.length - 1; i >= 0; i--) {
    if (distance(player.x, player.y, coins[i].x, coins[i].y) < 40) {
      money += COIN_VALUE_IN_KR;
      float("+" + COIN_VALUE_IN_KR + " kr", coins[i].x, coins[i].y, "#ffd34e");
      coins.splice(i, 1);
      sfx("mont");
      remember();
    }
  }
  coinTimer += dt;
  if (coinTimer > COIN_INTERVAL_IN_SECONDS) { coinTimer = 0; if (coins.length < MAX_COINS) addCoin(); }

  buildings.forEach(function (building) {
    if (building.type === "hus" || visitorAt(building)) return;
    building.wait -= dt;
    if (building.wait > 0) return;
    var type = BUILDINGS[building.type];
    visitors.push({
      face: VISITOR_FACES[Math.floor(Math.random() * VISITOR_FACES.length)],
      animal: SICK_ANIMALS[Math.floor(Math.random() * SICK_ANIMALS.length)],
      item: type.items[Math.floor(Math.random() * type.items.length)],
      building: building, state: "walking", x: PIER.x, y: PIER.y
    });
    sfx("klik");
  });

  for (var v = visitors.length - 1; v >= 0; v--) {
    var visitor = visitors[v];
    if (visitor.state === "walking") {
      var front = frontOf(visitor.building);
      if (moveToward(visitor, front.x, front.y, VISITOR_SPEED, dt)) visitor.state = "waiting";
    } else if (visitor.state === "leaving") {
      if (moveToward(visitor, PIER.x, PIER.y + 40, VISITOR_SPEED * 1.3, dt)) visitors.splice(v, 1);
    }
  }
}

function updateInside(dt) {
  if (!dragging) moveToward(player, player.targetX, player.targetY, PLAYER_SPEED, dt);
  if (pendingAction && distance(player.x, player.y, pendingAction.x, Math.min(FLOOR_BOTTOM, pendingAction.y + 50)) < 70) {
    useFurniture(pendingAction);
    pendingAction = null;
  }
  if (cooking > 0) {
    cooking -= dt;
    if (cooking <= 0) { say("Mmm! " + DISHES[Math.floor(Math.random() * DISHES.length)] + " 😋"); sfx("sejr"); }
  }
}

function useFurniture(item) {
  var kind = FURNITURE[item.kind];
  sfx(kind.sound);
  if (item.kind !== "kokken") { say(kind.words); return; }
  var hasService = home.furniture.some(function (other) { return other.kind === "service"; });
  if (!hasService) { say("Jeg mangler service 🍽️"); return; }
  say("Jeg laver mad… 🍳");
  cooking = 1.6;
}

function freeSpot() {
  for (var row = 0; row < 3; row++) {
    for (var column = 0; column < 5; column++) {
      var x = 200 + column * 155;
      var y = FLOOR_TOP + 70 + row * 130;
      var taken = home.furniture.some(function (item) { return Math.abs(item.x - x) < 130 && Math.abs(item.y - y) < 110; });
      if (!taken) return { x: x, y: y };
    }
  }
  return { x: random(200, 820), y: random(FLOOR_TOP + 70, FLOOR_BOTTOM - 40) };
}

function furnitureAt(x, y) {
  var top = null;
  home.furniture.forEach(function (item) {
    if (Math.abs(x - item.x) < 70 && Math.abs(y - item.y) < 60 && (!top || item.y >= top.y)) top = item;
  });
  return top;
}

// ---- Drawing ----

function oval(x, y, radiusX, radiusY, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(radiusX / radiusY, 1);
  circle(0, 0, radiusY, color);
  ctx.restore();
}

function drawIsland() {
  clear(theme.sea);
  for (var w = 0; w < 14; w++) box((w * 173) % 1000, (w * 311) % 740, 50, 5, "rgba(255,255,255,0.25)");
  oval(ISLAND.x, ISLAND.y, ISLAND.sandX, ISLAND.sandY, theme.sand);
  oval(ISLAND.x, ISLAND.y, ISLAND.grassX, ISLAND.grassY, theme.grass);
  box(PIER.x - 30, 650, 60, 118, "#a0703c");
  for (var plank = 655; plank < 768; plank += 18) box(PIER.x - 30, plank, 60, 3, "#7c5228");
  emoji("⛵", PIER.x + 80, 735 + Math.sin(Date.now() / 700) * 4, 60);
  palms.forEach(function (palm) { emoji("🌴", palm.x, palm.y, 60); });
}

function drawPlot(plot, index) {
  var building = buildingOn(index);
  if (!building) {
    box(plot.x, plot.y, PLOT_WIDTH, PLOT_HEIGHT, "rgba(255,255,255,0.3)");
    emoji("🚧", plot.x + PLOT_WIDTH / 2, plot.y + 48, 44);
    text("Byg her", plot.x + PLOT_WIDTH / 2, plot.y + 96, 20);
    return;
  }
  var type = BUILDINGS[building.type];
  box(plot.x + 8, plot.y + 34, PLOT_WIDTH - 16, PLOT_HEIGHT - 34, "#f8f0e3");
  box(plot.x, plot.y + 8, PLOT_WIDTH, 30, type.roof);
  box(plot.x + 22, plot.y + 56, 34, 30, "#bde0fe");
  box(plot.x + PLOT_WIDTH - 56, plot.y + 56, 34, 30, "#bde0fe");
  box(plot.x + PLOT_WIDTH / 2 - 15, plot.y + 76, 30, 44, "#8b5a2b");
  text(type.name, plot.x + PLOT_WIDTH / 2, plot.y + 23, 17);
  emoji(type.sign, plot.x + PLOT_WIDTH / 2, plot.y - 10, 36);
}

function drawVisitor(visitor) {
  emoji(visitor.face, visitor.x, visitor.y, 50);
  if (visitor.building.type === "hospital") emoji(visitor.animal, visitor.x - 34, visitor.y + 14, 32);
  if (visitor.state !== "waiting") return;
  var left = visitor.x + 32;
  box(left, visitor.y - 62, 120, 56, "#fff");
  if (visitor.building.type === "hospital") {
    text(visitor.animal + " 🤒", left + 60, visitor.y - 46, 18, "#222");
  } else {
    text("Må jeg få", left + 60, visitor.y - 46, 16, "#222");
  }
  emoji(visitor.item.emoji, left + 60, visitor.y - 22, 24);
}

function drawSpeech(x, y) {
  if (!speech) return;
  if (!speech.width) { ctx.font = fontFor(22); speech.width = ctx.measureText(speech.words).width + 40; }
  var left = Math.max(10, Math.min(WIDTH - 10 - speech.width, x - speech.width / 2));
  box(left, y - 110, speech.width, 50, "#fff");
  text(speech.words, left + speech.width / 2, y - 85, 22, "#222");
}

function bigButton(x, y, width, height, label, color) {
  box(x, y + 5, width, height, "rgba(0,0,0,0.3)");
  box(x, y, width, height, color);
  text(label, x + width / 2, y + height / 2, 28);
}

function drawFurniture(item) {
  if (item.kind === "kokken") {
    box(item.x - 70, item.y - 55, 140, 110, "#e2e8f0");
    box(item.x - 70, item.y - 55, 140, 16, "#a0aec0");
    circle(item.x - 30, item.y - 20, 16, "#4a5568");
    circle(item.x + 30, item.y - 20, 16, "#4a5568");
    emoji("🍳", item.x - 30, item.y - 22, 34);
    box(item.x - 60, item.y + 10, 120, 36, "#cbd5e0");
    return;
  }
  emoji(FURNITURE[item.kind].emoji, item.x, item.y, 100);
}

function drawInside() {
  box(0, 0, WIDTH, FLOOR_TOP, "#e3f7f5");
  for (var x = 0; x < WIDTH; x += 80) box(x, 0, 40, FLOOR_TOP, "#d0f0ec");
  box(0, FLOOR_TOP, WIDTH, HEIGHT - FLOOR_TOP, "#d9b38c");
  for (var y = FLOOR_TOP + 50; y < HEIGHT; y += 50) box(0, y, WIDTH, 3, "#c49a6c");
  box(0, FLOOR_TOP - 12, WIDTH, 12, "#a0703c");
  box(380, 60, 260, 150, theme.sea);
  box(380, 150, 260, 60, theme.sand);
  emoji("🌴", 590, 140, 50);
  box(505, 60, 10, 150, "#fff");
  box(380, 130, 260, 10, "#fff");
  text("🏠 Mit hus", WIDTH / 2, 30, 30, "#5a3825");
  var everything = home.furniture.slice().sort(function (a, b) { return a.y - b.y; });
  everything.forEach(drawFurniture);
  if (everything.length === 0) text("Tryk på 🛒 Møbler for at købe møbler", WIDTH / 2, 420, 26, "#fff");
  emoji("👧", player.x, player.y, 70);
  drawSpeech(player.x, player.y);
  box(0, 660, WIDTH, 108, "rgba(0,0,0,0.2)");
  bigButton(240, 672, 240, 84, "🛒 Møbler", "#b7791f");
  bigButton(544, 672, 240, 84, "🚪 Gå ud", "#2f855a");
}

function choiceX(i, count) { return WIDTH / 2 + (i - (count - 1) / 2) * 173; }

function drawMenu() {
  box(0, 0, WIDTH, HEIGHT, "rgba(0,0,0,0.55)");
  box(162, 150, 700, 470, "#fff8e7");
  box(790, 156, 64, 64, "#e2d6bd");
  text("✖️", 822, 188, 34);
  if (menu.kind === "furniture") {
    text("Hvilket møbel vil du købe?", WIDTH / 2, 205, 32, "#222");
    text("Du har " + money + " kr", WIDTH / 2, 245, 22, "#555");
    FURNITURE_ORDER.forEach(function (key, i) {
      var item = FURNITURE[key];
      var x = choiceX(i % 4, 4);
      var y = 270 + Math.floor(i / 4) * 170;
      var canAfford = money >= item.priceInKr;
      box(x - 75, y, 150, 150, canAfford ? "#b7791f" : "#cccccc");
      emoji(item.emoji, x, y + 52, 56);
      text(item.name, x, y + 105, 20, canAfford ? "#fff" : "#888");
      text(item.priceInKr + " kr", x, y + 132, 18, canAfford ? "#fff" : "#888");
    });
    return;
  }
  if (menu.kind === "build") {
    text("Hvad vil du bygge?", WIDTH / 2, 205, 36, "#222");
    text("Du har " + money + " kr", WIDTH / 2, 248, 22, "#555");
    BUILD_ORDER.forEach(function (key, i) {
      var type = BUILDINGS[key];
      var x = choiceX(i, BUILD_ORDER.length);
      var canAfford = money >= type.priceInKr;
      box(x - 78, 290, 156, 220, canAfford ? type.roof : "#cccccc");
      emoji(type.sign, x, 355, 64);
      text(type.name, x, 425, 19, canAfford ? "#fff" : "#888");
      text(type.priceInKr + " kr", x, 465, 24, canAfford ? "#fff" : "#888");
    });
    return;
  }
  var visitor = menu.visitor;
  var question = visitor.building.type === "hospital" ? "Mit dyr er sygt. Hvad skal det have?" : "Må jeg få " + visitor.item.name + "?";
  text(visitor.face + " " + question, WIDTH / 2, 215, 28, "#222");
  text("Tryk på den rigtige ting", WIDTH / 2, 258, 22, "#555");
  var items = BUILDINGS[visitor.building.type].items;
  items.forEach(function (item, i) {
    var x = choiceX(i, items.length);
    box(x - 75, 300, 150, 200, "#ffffff");
    emoji(item.emoji, x, 370, 72);
    text(item.priceInKr + " kr", x, 460, 24, "#222");
  });
}

function draw() {
  if (scene === "inside") {
    drawInside();
    floaters.forEach(function (f) { text(f.words, f.x, f.y, 26, f.color); });
    box(WIDTH - 230, 12, 210, 56, "rgba(0,0,0,0.3)");
    text("💰 " + money + " kr", WIDTH - 125, 40, 30);
    if (menu) drawMenu();
    return;
  }
  drawIsland();
  plots.forEach(drawPlot);
  coins.forEach(function (coin) { circle(coin.x, coin.y, 16, "#c99a06"); circle(coin.x, coin.y, 12, "#ffd34e"); });
  visitors.forEach(drawVisitor);
  emoji("👧", player.x, player.y, 60);
  drawSpeech(player.x, player.y);
  floaters.forEach(function (f) { text(f.words, f.x, f.y, 26, f.color); });
  box(WIDTH - 230, 12, 210, 56, "rgba(0,0,0,0.3)");
  text("💰 " + money + " kr", WIDTH - 125, 40, 30);
  if (buildings.length === 0 && !menu) {
    box(212, 700, 600, 50, "rgba(0,0,0,0.35)");
    text("👆 Gå rundt og saml mønter · tryk på 🚧 for at bygge", WIDTH / 2, 725, 21);
  }
  if (menu) drawMenu();
}

// ---- Touch ----

function tapMenu(x, y) {
  if ((x > 770 && x < 870 && y > 136 && y < 236) || x < 162 || x > 862 || y < 150 || y > 620) { menu = null; return; }
  if (menu.kind === "furniture") {
    FURNITURE_ORDER.forEach(function (key, i) {
      var cx = choiceX(i % 4, 4);
      var top = 270 + Math.floor(i / 4) * 170;
      if (Math.abs(x - cx) > 75 || y < top || y > top + 150) return;
      var item = FURNITURE[key];
      if (money < item.priceInKr) { sfx("bump"); float("Du mangler " + (item.priceInKr - money) + " kr", WIDTH / 2, 600, "#c53030"); return; }
      money -= item.priceInKr;
      var spot = freeSpot();
      home.furniture.push({ kind: key, x: spot.x, y: spot.y });
      say("Nyt møbel! Træk det hen hvor du vil 👆");
      sfx("hammer");
      remember();
      menu = null;
    });
    return;
  }
  if (menu.kind === "build") {
    BUILD_ORDER.forEach(function (key, i) {
      if (Math.abs(x - choiceX(i, BUILD_ORDER.length)) > 78 || y < 290 || y > 510) return;
      var type = BUILDINGS[key];
      if (money < type.priceInKr) { sfx("bump"); float("Du mangler " + (type.priceInKr - money) + " kr", WIDTH / 2, 580, "#c53030"); return; }
      money -= type.priceInKr;
      var built = { plot: menu.plot, type: key, wait: random(3, 6) };
      if (key === "hus") built.furniture = [];
      buildings.push(built);
      var plot = plots[menu.plot];
      float(key === "hus" ? "Dit eget hus! 🎉" : type.name + "! 🎉", plot.x + PLOT_WIDTH / 2, plot.y, "#fff");
      sfx("hammer");
      remember();
      menu = null;
    });
    return;
  }
  var visitor = menu.visitor;
  var items = BUILDINGS[visitor.building.type].items;
  items.forEach(function (item, i) {
    if (Math.abs(x - choiceX(i, items.length)) > 75 || y < 300 || y > 500) return;
    if (item === visitor.item) {
      money += item.priceInKr;
      float("Tak! +" + item.priceInKr + " kr", visitor.x, visitor.y - 60, "#ffd34e");
      visitor.state = "leaving";
      visitor.building.wait = random(5, 10);
      sfx("sejr");
      remember();
      menu = null;
    } else {
      sfx("bump");
      float("Nej, det var ikke det 😅", WIDTH / 2, 570, "#c53030");
    }
  });
}

function goInside(house) {
  home = house;
  islandSpot = { x: player.x, y: player.y };
  player.x = player.targetX = 512;
  player.y = player.targetY = 600;
  scene = "inside";
  sfx("klik");
}

function goOutside() {
  scene = "island";
  player.x = player.targetX = islandSpot.x;
  player.y = player.targetY = islandSpot.y;
  home = null;
  pendingAction = null;
  sfx("klik");
}

function tapInside(x, y) {
  if (y > 660) {
    if (x > 240 && x < 480) { menu = { kind: "furniture" }; sfx("klik"); }
    if (x > 544 && x < 784) goOutside();
    return;
  }
  var item = furnitureAt(x, y);
  if (item) { dragging = { item: item, startX: x, startY: y, offsetX: item.x - x, offsetY: item.y - y, moved: false }; return; }
  player.targetX = x;
  player.targetY = Math.max(FLOOR_TOP + 30, Math.min(FLOOR_BOTTOM, y));
}

function onDrag(x, y) {
  if (!dragging) return;
  if (!dragging.moved && distance(x, y, dragging.startX, dragging.startY) < 15) return;
  dragging.moved = true;
  dragging.item.x = Math.max(70, Math.min(WIDTH - 70, x + dragging.offsetX));
  dragging.item.y = Math.max(FLOOR_TOP - 20, Math.min(FLOOR_BOTTOM - 20, y + dragging.offsetY));
}

function onRelease() {
  if (!dragging) return;
  var item = dragging.item;
  if (dragging.moved) {
    remember();
  } else {
    pendingAction = item;
    player.targetX = item.x;
    player.targetY = Math.min(FLOOR_BOTTOM, item.y + 50);
  }
  dragging = null;
}

function onTap(x, y) {
  if (menu) { tapMenu(x, y); return; }
  if (scene === "inside") { tapInside(x, y); return; }
  for (var i = 0; i < visitors.length; i++) {
    var visitor = visitors[i];
    if (visitor.state === "waiting" && x > visitor.x - 40 && x < visitor.x + 160 && y > visitor.y - 70 && y < visitor.y + 34) {
      menu = { kind: "help", visitor: visitor };
      return;
    }
  }
  var index = plotAt(x, y);
  if (index !== -1) {
    var building = buildingOn(index);
    if (!building) { menu = { kind: "build", plot: index }; return; }
    var waiting = visitorAt(building);
    if (waiting && waiting.state === "waiting") { menu = { kind: "help", visitor: waiting }; return; }
    if (building.type === "hus") { goInside(building); return; }
  }
  if (onIsland(x, y, ISLAND.sandX - 20, ISLAND.sandY - 20)) {
    player.targetX = x;
    player.targetY = y;
  }
}
