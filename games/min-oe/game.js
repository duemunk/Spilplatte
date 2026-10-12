useFont("rund");

var theme = { sea: "#1ea7c9", sand: "#f5e1a4", grass: "#8fd16a", text: "#fff" };

var ISLAND = { x: 512, y: 384, sandX: 422, sandY: 314, grassX: 362, grassY: 264 };
var GROW_X = 190;
var GROW_Y = 150;
var GROW_BASE_PRICE_IN_KR = 80;
var GROW_PRICE_STEP_IN_KR = 60;
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
  bamse: { emoji: "🧸", name: "Bamse", priceInKr: 8, words: "Kram! 🧸💕", sound: "pop" },
  klaver: { emoji: "🎹", name: "Klaver", priceInKr: 30, words: "Ding dong ding 🎶", sound: "sejr" },
  bruser: { emoji: "🚿", name: "Bruser", priceInKr: 15, words: "Splash! 💦", sound: "boing" },
  lampe: { emoji: "💡", name: "Lampe", priceInKr: 8, words: "Nu er der lys 💡", sound: "klik" },
  boger: { emoji: "📚", name: "Bøger", priceInKr: 10, words: "Jeg læser en god bog 📖", sound: "klik" },
  spil: { emoji: "🎮", name: "Spillekonsol", priceInKr: 25, words: "Jeg vandt! 🎮🏆", sound: "laser" },
  ur: { emoji: "🕰️", name: "Ur", priceInKr: 10, words: "Tik tak ⏰", sound: "klik" },
  kaktus: { emoji: "🌵", name: "Kaktus", priceInKr: 5, words: "Av, den stikker! 🌵", sound: "bump" },
  billede: { emoji: "🖼️", name: "Billede", priceInKr: 12, words: "Sikke et flot billede 🖼️", sound: "klik" },
  blomst: { emoji: "🌺", name: "Blomst", priceInKr: 5, words: "Den dufter godt 🌸", sound: "klik" }
};
var FURNITURE_ORDER = ["seng", "sofa", "fjernsyn", "toilet", "badekar", "bruser", "kokken", "service", "blomst", "bamse", "klaver", "lampe", "boger", "spil", "ur", "kaktus", "billede"];
var PETS = {
  hund: { emoji: "🐶", name: "Hund", priceInKr: 30, words: "Vov vov! 🐾" },
  kat: { emoji: "🐱", name: "Kat", priceInKr: 30, words: "Miav! 💕" },
  kanin: { emoji: "🐰", name: "Kanin", priceInKr: 25, words: "Hop hop! 🥕" },
  hamster: { emoji: "🐹", name: "Hamster", priceInKr: 20, words: "Pip pip! 🌰" },
  hest: { emoji: "🐴", name: "Hest", priceInKr: 60, words: "Vrinsk! 🐎" },
  fisk: { emoji: "🐠", name: "Fisk", priceInKr: 15, words: "Blub blub 💧" },
  papegoje: { emoji: "🦜", name: "Papegøje", priceInKr: 35, words: "Hej hej! Rap rap! 🦜" },
  enhjorning: { emoji: "🦄", name: "Enhjørning", priceInKr: 80, words: "Magi! ✨🌈" },
  gris: { emoji: "🐷", name: "Gris", priceInKr: 25, words: "Øf øf! 🐷" },
  skildpadde: { emoji: "🐢", name: "Skildpadde", priceInKr: 20, words: "Lang… som… om… 🐢" },
  pindsvin: { emoji: "🦔", name: "Pindsvin", priceInKr: 20, words: "Snøft snøft 🦔" },
  hone: { emoji: "🐔", name: "Høne", priceInKr: 15, words: "Gok gok! 🥚" }
};
var PET_ORDER = ["hund", "kat", "kanin", "hamster", "hest", "fisk", "papegoje", "enhjorning", "gris", "skildpadde", "pindsvin", "hone"];
var PET_FOOD = { emoji: "🦴", name: "Dyremad x5", priceInKr: 10, portions: 5 };
var HUNGRY_AT = 70;
var HUNGER_PER_SECOND = 100 / 180;
var PET_MEALS = { hund: "et kødben 🍖", kat: "en fisk 🐟", kanin: "en gulerod 🥕", hamster: "en nød 🌰", hest: "et æble 🍎", fisk: "fiskefoder 🐠", papegoje: "nogle frø 🌻", enhjorning: "regnbuekage 🌈🍰", gris: "en æblekerne 🍏", skildpadde: "salat 🥬", pindsvin: "en orm 🐛", hone: "majs 🌽" };
var DISHES = ["🍝", "🍕", "🥞", "🍲", "🌮", "🥗", "🍍"];
var FLOOR_TOP = 290;
var FLOOR_BOTTOM = 640;
var VISITOR_FACES = ["👩", "👨", "👵", "👴", "👦", "👧", "🧔", "👱‍♀️"];
var SICK_ANIMALS = ["🐶", "🐱", "🐰", "🐹", "🐦", "🐢"];

var plots = [
  { x: 240, y: 215 }, { x: 437, y: 175 }, { x: 634, y: 215 }, { x: 330, y: 420 }, { x: 560, y: 420 }
];
var BASE_PLOTS = plots;
var islandLevel = 0;
var camera = { x: 0, y: 0 };
var BASE_PALMS = [
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
var food = 0;
var petFollowers = [];

var palms = BASE_PALMS;

function setIslandSize() {
  ISLAND.grassX = 362 + islandLevel * GROW_X;
  ISLAND.grassY = 264 + islandLevel * GROW_Y;
  ISLAND.sandX = ISLAND.grassX + 60;
  ISLAND.sandY = ISLAND.grassY + 50;
  PIER.y = ISLAND.y + ISLAND.sandY - 15;
  palms = islandLevel === 0 ? BASE_PALMS : [];
  if (islandLevel > 0) {
    var count = 10 + islandLevel * 6;
    for (var i = 0; i < count; i++) {
      var angle = i / count * Math.PI * 2;
      var x = ISLAND.x + Math.cos(angle) * (ISLAND.grassX - 30);
      var y = ISLAND.y + Math.sin(angle) * (ISLAND.grassY - 30);
      if (Math.abs(x - PIER.x) < 90 && y > ISLAND.y) continue;
      palms.push({ x: x, y: y });
    }
  }
}

function growPrice() {
  return GROW_BASE_PRICE_IN_KR + islandLevel * GROW_PRICE_STEP_IN_KR;
}

function plotFits(x, y) {
  var corners = [[x, y], [x + PLOT_WIDTH, y], [x, y + PLOT_HEIGHT + 60], [x + PLOT_WIDTH, y + PLOT_HEIGHT + 60]];
  var inside = corners.every(function (c) { return onIsland(c[0], c[1], ISLAND.grassX * 0.94, ISLAND.grassY * 0.94); });
  if (!inside) return false;
  if (Math.abs(x + PLOT_WIDTH / 2 - PIER.x) < 130 && y + PLOT_HEIGHT > ISLAND.y + ISLAND.grassY - 220) return false;
  return !plots.some(function (p) {
    return x < p.x + PLOT_WIDTH + 40 && x + PLOT_WIDTH + 40 > p.x && y < p.y + PLOT_HEIGHT + 60 && y + PLOT_HEIGHT + 60 > p.y;
  });
}

function addPlots() {
  for (var y = ISLAND.y - ISLAND.grassY; y < ISLAND.y + ISLAND.grassY; y += 45) {
    for (var x = ISLAND.x - ISLAND.grassX; x < ISLAND.x + ISLAND.grassX; x += 45) {
      if (plotFits(x, y)) plots.push({ x: Math.round(x), y: Math.round(y) });
    }
  }
}

function growIsland() {
  money -= growPrice();
  islandLevel++;
  setIslandSize();
  var before = plots.length;
  addPlots();
  float("Øen blev større! +" + (plots.length - before) + " grunde 🎉", player.x, player.y - 70, "#fff");
  sfx("hammer");
  remember();
}

function setup() {
  var saved = load("state", null);
  if (saved) {
    money = saved.money;
    buildings = saved.buildings;
    islandLevel = saved.islandLevel || 0;
    food = saved.food || 0;
    plots = saved.plots || BASE_PLOTS;
  }
  setIslandSize();
  buildings.forEach(function (building) {
    building.wait = random(3, 7);
    if (building.type === "hus") {
      building.furniture = building.furniture || [];
      building.pets = building.pets || [];
    }
  });
  rebuildFollowers();
  for (var i = 0; i < 4; i++) addCoin();
}

function remember() {
  save("state", {
    money: money,
    food: food,
    islandLevel: islandLevel,
    plots: plots,
    buildings: buildings.map(function (b) {
      return b.type === "hus" ? { plot: b.plot, type: b.type, furniture: b.furniture, pets: b.pets } : { plot: b.plot, type: b.type };
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
    var x = random(ISLAND.x - ISLAND.sandX, ISLAND.x + ISLAND.sandX);
    var y = random(ISLAND.y - ISLAND.sandY, ISLAND.y + ISLAND.sandY);
    if (onIsland(x, y, ISLAND.sandX - 30, ISLAND.sandY - 30) && plotAt(x, y) === -1) { coins.push({ x: x, y: y }); return; }
  }
}

function float(words, x, y, color) {
  floaters.push({ words: words, x: x, y: y, color: color, life: 1.4 });
}

function allPets() {
  var pets = [];
  buildings.forEach(function (b) { if (b.type === "hus") pets = pets.concat(b.pets); });
  return pets;
}

function rebuildFollowers() {
  var old = petFollowers;
  petFollowers = [];
  allPets().forEach(function (pet) {
    if (pet.kind === "fisk") return;
    var previous = old[petFollowers.length];
    petFollowers.push({ pet: pet, kind: pet.kind, x: previous ? previous.x : player.x - 50, y: previous ? previous.y : player.y + 20 });
  });
}

function followPets(dt) {
  var leaderX = player.x;
  var leaderY = player.y;
  petFollowers.forEach(function (pet) {
    var dx = leaderX - pet.x;
    var dy = leaderY - pet.y;
    var length = Math.sqrt(dx * dx + dy * dy);
    if (length > 60) {
      var step = Math.min(length - 60, PLAYER_SPEED * 0.9 * dt);
      pet.x += dx / length * step;
      pet.y += dy / length * step;
    }
    leaderX = pet.x;
    leaderY = pet.y;
  });
}

function petAt(x, y) {
  for (var i = 0; i < petFollowers.length; i++) {
    if (distance(x, y, petFollowers[i].x, petFollowers[i].y) < 45) return petFollowers[i];
  }
  return null;
}

function feed(pets) {
  var hungry = pets.filter(function (pet) { return pet.hunger >= HUNGRY_AT; });
  var name = PETS[pets[0].kind].name.toLowerCase();
  if (hungry.length === 0) { say(PETS[pets[0].kind].words + " Jeg er mæt ❤️"); sfx("pop"); return; }
  if (food === 0) { say("Køb dyremad under 🐾 Dyr i dit hus"); sfx("bump"); return; }
  food--;
  hungry.forEach(function (pet) { pet.hunger = 0; });
  say("Nam nam! Din " + name + " fik " + PET_MEALS[pets[0].kind] + " ❤️");
  sfx("sejr");
  remember();
}

function drawHungry(x, y) {
  box(x - 44, y - 30, 88, 30, "#fff");
  text("Sulten 🍖", x, y - 15, 16, "#c53030");
}

function drawPets() {
  petFollowers.forEach(function (pet) {
    var size = pet.kind === "hest" || pet.kind === "enhjorning" ? 80 : 46;
    emoji(PETS[pet.kind].emoji, pet.x, pet.y, size);
    if (pet.pet.hunger >= HUNGRY_AT) drawHungry(pet.x, pet.y - size / 2);
  });
}

function aquarium() {
  var fish = home.pets.filter(function (pet) { return pet.kind === "fisk"; });
  if (fish.length === 0) return null;
  return { kind: "akvarium", x: 820, y: 210, fish: fish };
}

function gridSpot(i, count) {
  var compact = count > 8;
  var perRow = compact ? 6 : Math.min(4, count);
  var spacing = compact ? 112 : 173;
  return {
    x: WIDTH / 2 + ((i % perRow) - (perRow - 1) / 2) * spacing,
    y: (compact ? 316 : 345) + Math.floor(i / perRow) * (compact ? 112 : 170),
    half: compact ? 52 : 75
  };
}

function drawGridChoice(spot, symbol, name, priceInKr, color) {
  var canAfford = money >= priceInKr;
  var small = spot.half < 75;
  box(spot.x - spot.half, spot.y - spot.half, spot.half * 2, spot.half * 2, canAfford ? color : "#cccccc");
  emoji(symbol, spot.x, spot.y - (small ? 18 : 22), small ? 44 : 60);
  text(name, spot.x, spot.y + (small ? 18 : 30), small ? 15 : 22, canAfford ? "#fff" : "#888");
  text(priceInKr + " kr", spot.x, spot.y + (small ? 38 : 58), small ? 14 : 20, canAfford ? "#fff" : "#888");
}

var OWN_CAKES = [
  { emoji: "🧁", name: "Cupcake", priceInKr: 4 },
  { emoji: "🍰", name: "Lagkage", priceInKr: 6 },
  { emoji: "🍩", name: "Donut", priceInKr: 3 },
  { emoji: "🍪", name: "Småkage", priceInKr: 2 }
];

function firstHouse() {
  for (var i = 0; i < buildings.length; i++) if (buildings[i].type === "hus") return buildings[i];
  return null;
}

function shopChoices() {
  if (menu.kind === "cakes") return OWN_CAKES;
  if (menu.kind === "stable") return [PETS.hest, PETS.enhjorning];
  return [];
}

function petChoices() {
  return PET_ORDER.map(function (key) { return PETS[key]; }).concat([PET_FOOD]);
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
  allPets().forEach(function (pet) { pet.hunger = Math.min(100, pet.hunger + HUNGER_PER_SECOND * dt); });
  followPets(dt);
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
  if (coinTimer > COIN_INTERVAL_IN_SECONDS) { coinTimer = 0; if (coins.length < MAX_COINS + islandLevel * 4) addCoin(); }
  var spanX = ISLAND.sandX + 150 - WIDTH / 2;
  var spanY = ISLAND.sandY + 150 - HEIGHT / 2;
  camera.x = spanX > 0 ? Math.max(-spanX, Math.min(spanX, player.x - ISLAND.x)) : 0;
  camera.y = spanY > 0 ? Math.max(-spanY, Math.min(spanY, player.y - ISLAND.y)) : 0;

  buildings.forEach(function (building) {
    if (building.type === "hus" || visitorAt(building)) return;
    building.wait -= dt;
    if (building.wait > 0) return;
    var type = BUILDINGS[building.type];
    visitors.push({
      face: VISITOR_FACES[Math.floor(Math.random() * VISITOR_FACES.length)],
      animal: SICK_ANIMALS[Math.floor(Math.random() * SICK_ANIMALS.length)],
      item: type.items[Math.floor(Math.random() * type.items.length)],
      building: building, state: "walking", x: PIER.x, y: PIER.y - 50
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
  for (var w = 0; w < 14; w++) {
    var wx = (((w * 173) - camera.x * 0.5) % 1000 + 1000) % 1000;
    var wy = (((w * 311) - camera.y * 0.5) % 740 + 740) % 740;
    box(wx, wy, 50, 5, "rgba(255,255,255,0.25)");
  }
  ctx.save();
  ctx.translate(-Math.round(camera.x), -Math.round(camera.y));
  oval(ISLAND.x, ISLAND.y, ISLAND.sandX, ISLAND.sandY, theme.sand);
  oval(ISLAND.x, ISLAND.y, ISLAND.grassX, ISLAND.grassY, theme.grass);
  box(PIER.x - 30, PIER.y - 55, 60, 120, "#a0703c");
  for (var plank = PIER.y - 50; plank < PIER.y + 65; plank += 18) box(PIER.x - 30, plank, 60, 3, "#7c5228");
  emoji("⛵", PIER.x + 80, PIER.y + 30 + Math.sin(Date.now() / 700) * 4, 60);
  palms.forEach(function (palm) { emoji("🌴", palm.x, palm.y, 60); });
}

function drawVisitorArrows() {
  visitors.forEach(function (visitor) {
    if (visitor.state !== "waiting") return;
    var sx = visitor.x - camera.x;
    var sy = visitor.y - camera.y;
    if (sx > 40 && sx < WIDTH - 40 && sy > 40 && sy < HEIGHT - 40) return;
    var angle = Math.atan2(sy - HEIGHT / 2, sx - WIDTH / 2);
    var ex = Math.max(60, Math.min(WIDTH - 60, sx));
    var ey = Math.max(150, Math.min(HEIGHT - 130, sy));
    circle(ex, ey, 38, "rgba(255,255,255,0.9)");
    emoji(visitor.face, ex, ey, 40);
    ctx.save();
    ctx.translate(ex + Math.cos(angle) * 46, ey + Math.sin(angle) * 46);
    ctx.rotate(angle);
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(-10, -14);
    ctx.lineTo(-10, 14);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
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
  if (item.kind === "akvarium") {
    box(item.x - 90, item.y - 60, 180, 120, "#90cdf4");
    box(item.x - 90, item.y + 50, 180, 12, "#d69e2e");
    item.fish.forEach(function (pet, i) {
      emoji("🐠", item.x - 40 + i * 25 + Math.sin(Date.now() / 600 + i) * 25, item.y - 20 + (i % 3) * 25, 40);
    });
    if (item.fish.some(function (pet) { return pet.hunger >= HUNGRY_AT; })) drawHungry(item.x, item.y - 60);
    return;
  }
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
  var everything = home.furniture.slice();
  var tank = aquarium();
  if (tank) everything.push(tank);
  everything.sort(function (a, b) { return a.y - b.y; });
  everything.forEach(drawFurniture);
  if (everything.length === 0) text("Tryk på 🛒 Møbler for at købe møbler", WIDTH / 2, 420, 26, "#fff");
  drawPets();
  emoji("👧", player.x, player.y, 70);
  drawSpeech(player.x, player.y);
  box(0, 660, WIDTH, 108, "rgba(0,0,0,0.2)");
  bigButton(150, 672, 220, 84, "🛒 Møbler", "#b7791f");
  bigButton(402, 672, 220, 84, "🐾 Dyr", "#d53f8c");
  bigButton(654, 672, 220, 84, "🚪 Gå ud", "#2f855a");
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
      drawGridChoice(gridSpot(i, FURNITURE_ORDER.length), item.emoji, item.name, item.priceInKr, "#b7791f");
    });
    return;
  }
  if (menu.kind === "cakes" || menu.kind === "stable") {
    text(menu.kind === "cakes" ? "🧁 Køb en kage til dig selv" : "🐴 Køb din egen hest", WIDTH / 2, 205, 32, "#222");
    text("Du har " + money + " kr", WIDTH / 2, 245, 22, "#555");
    var own = shopChoices();
    own.forEach(function (choice, i) {
      drawGridChoice(gridSpot(i, own.length), choice.emoji, choice.name, choice.priceInKr, menu.kind === "cakes" ? "#f783ac" : "#b07d48");
    });
    return;
  }
  if (menu.kind === "pets") {
    text("Hvilket dyr vil du have?", WIDTH / 2, 205, 32, "#222");
    text("Du har " + money + " kr · 🦴 dyremad: " + food, WIDTH / 2, 245, 22, "#555");
    var choices = petChoices();
    choices.forEach(function (choice, i) {
      drawGridChoice(gridSpot(i, choices.length), choice.emoji, choice.name, choice.priceInKr, "#d53f8c");
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
  drawPets();
  emoji("👧", player.x, player.y, 60);
  drawSpeech(player.x, player.y);
  floaters.forEach(function (f) { text(f.words, f.x, f.y, 26, f.color); });
  ctx.restore();
  drawVisitorArrows();
  box(WIDTH - 230, 12, 210, 56, "rgba(0,0,0,0.3)");
  text("💰 " + money + " kr", WIDTH - 125, 40, 30);
  var canGrow = money >= growPrice();
  box(WIDTH - 262, HEIGHT - 92, 250, 76, canGrow ? "#2f9e44" : "rgba(0,0,0,0.35)");
  text("🏝️ Større ø · " + growPrice() + " kr", WIDTH - 137, HEIGHT - 54, 22, canGrow ? "#fff" : "#ddd");
  if (buildings.length === 0 && !menu) {
    box(16, 700, 600, 50, "rgba(0,0,0,0.35)");
    text("👆 Gå rundt og saml mønter · tryk på 🚧 for at bygge", 316, 725, 21);
  }
  if (menu) drawMenu();
}

// ---- Touch ----

function tapMenu(x, y) {
  if ((x > 770 && x < 870 && y > 136 && y < 236) || x < 162 || x > 862 || y < 150 || y > 620) { menu = null; return; }
  if (menu.kind === "cakes" || menu.kind === "stable") {
    var own = shopChoices();
    var kind = menu.kind;
    own.forEach(function (choice, i) {
      var spot = gridSpot(i, own.length);
      if (Math.abs(x - spot.x) > spot.half || Math.abs(y - spot.y) > spot.half) return;
      var house = firstHouse();
      if (kind === "stable" && !house) { sfx("bump"); float("Byg et hus først 🏠", camera.x + WIDTH / 2, camera.y + 600, "#c53030"); return; }
      if (money < choice.priceInKr) { sfx("bump"); float("Du mangler " + (choice.priceInKr - money) + " kr", camera.x + WIDTH / 2, camera.y + 600, "#c53030"); return; }
      money -= choice.priceInKr;
      if (kind === "cakes") {
        say("Mmm! " + choice.emoji + " 😋");
        sfx("sejr");
      } else {
        var key = choice === PETS.hest ? "hest" : "enhjorning";
        house.pets.push({ kind: key, hunger: 0 });
        rebuildFollowers();
        say(choice.words);
        sfx("boing");
      }
      remember();
      menu = null;
    });
    return;
  }
  if (menu.kind === "pets") {
    var choices = petChoices();
    choices.forEach(function (choice, i) {
      var spot = gridSpot(i, choices.length);
      if (Math.abs(x - spot.x) > spot.half || Math.abs(y - spot.y) > spot.half) return;
      if (money < choice.priceInKr) { sfx("bump"); float("Du mangler " + (choice.priceInKr - money) + " kr", WIDTH / 2, 630, "#c53030"); return; }
      money -= choice.priceInKr;
      if (choice === PET_FOOD) {
        food += PET_FOOD.portions;
        say("Nu har du " + food + " portioner dyremad 🦴");
        sfx("mont");
      } else {
        var kind = PET_ORDER[i];
        home.pets.push({ kind: kind, hunger: 0 });
        rebuildFollowers();
        say(kind === "fisk" ? "Fisken bor i akvariet 🐠" : PETS[kind].words);
        sfx("boing");
      }
      remember();
      menu = null;
    });
    return;
  }
  if (menu.kind === "furniture") {
    FURNITURE_ORDER.forEach(function (key, i) {
      var spot = gridSpot(i, FURNITURE_ORDER.length);
      if (Math.abs(x - spot.x) > spot.half || Math.abs(y - spot.y) > spot.half) return;
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
      if (money < type.priceInKr) { sfx("bump"); float("Du mangler " + (type.priceInKr - money) + " kr", camera.x + WIDTH / 2, camera.y + 580, "#c53030"); return; }
      money -= type.priceInKr;
      var built = { plot: menu.plot, type: key, wait: random(3, 6) };
      if (key === "hus") { built.furniture = []; built.pets = []; }
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
      float("Nej, det var ikke det 😅", camera.x + WIDTH / 2, camera.y + 570, "#c53030");
    }
  });
}

function goInside(house) {
  home = house;
  islandSpot = { x: player.x, y: player.y };
  player.x = player.targetX = 512;
  player.y = player.targetY = 600;
  petFollowers.forEach(function (pet, i) { pet.x = 512 - 55 * (i + 1); pet.y = 620; });
  scene = "inside";
  sfx("klik");
}

function goOutside() {
  scene = "island";
  player.x = player.targetX = islandSpot.x;
  player.y = player.targetY = islandSpot.y;
  petFollowers.forEach(function (pet, i) { pet.x = player.x - 55 * (i + 1); pet.y = player.y + 20; });
  home = null;
  pendingAction = null;
  sfx("klik");
}

function tapInside(x, y) {
  if (y > 660) {
    if (x > 150 && x < 370) { menu = { kind: "furniture" }; sfx("klik"); }
    if (x > 402 && x < 622) { menu = { kind: "pets" }; sfx("klik"); }
    if (x > 654 && x < 874) goOutside();
    return;
  }
  var pet = petAt(x, y);
  if (pet) { feed([pet.pet]); float("❤️", pet.x, pet.y - 40, "#fff"); return; }
  var tank = aquarium();
  if (tank && Math.abs(x - tank.x) < 90 && Math.abs(y - tank.y) < 60) { feed(tank.fish); return; }
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
  if (x > WIDTH - 262 && y > HEIGHT - 92) {
    if (money >= growPrice()) growIsland();
    else { sfx("bump"); float("Du mangler " + (growPrice() - money) + " kr", player.x, player.y - 70, "#c53030"); }
    return;
  }
  x += camera.x;
  y += camera.y;
  var pet = petAt(x, y);
  if (pet) { feed([pet.pet]); float("❤️", pet.x, pet.y - 40, "#fff"); return; }
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
    if (building.type === "bageri") { menu = { kind: "cakes" }; sfx("klik"); return; }
    if (building.type === "stald") { menu = { kind: "stable" }; sfx("klik"); return; }
  }
  if (onIsland(x, y, ISLAND.sandX - 20, ISLAND.sandY - 20)) {
    player.targetX = x;
    player.targetY = y;
  }
}
