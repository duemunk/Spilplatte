useFont("kridt");

var theme = { grass: "#6bb35a", road: "#6e6e73", line: "#ffffff", brick: "#b5523b", text: "#fff" };

var PLAYER_SPEED = 320;
var COIN_VALUE_IN_KR = 2;
var MAX_COINS = 10;
var COIN_INTERVAL_IN_SECONDS = 1.5;

var SHOP_TYPES = {
  bageri: {
    name: "Bageri", sign: "🥐", priceInKr: 20, roof: "#f6ad55",
    items: [
      { emoji: "🥐", name: "en croissant", priceInKr: 5 },
      { emoji: "🍞", name: "et brød", priceInKr: 6 },
      { emoji: "🧁", name: "en kage", priceInKr: 7 },
      { emoji: "🍩", name: "en donut", priceInKr: 5 }
    ]
  },
  apotek: {
    name: "Apotek", sign: "💊", priceInKr: 30, roof: "#68d391",
    items: [
      { emoji: "💊", name: "noget medicin", priceInKr: 8 },
      { emoji: "🌡️", name: "et termometer", priceInKr: 9 },
      { emoji: "🧴", name: "noget creme", priceInKr: 7 },
      { emoji: "🍬", name: "en halspastil", priceInKr: 6 }
    ]
  },
  kobmand: {
    name: "Købmand", sign: "🛒", priceInKr: 40, roof: "#63b3ed",
    items: [
      { emoji: "🍎", name: "et æble", priceInKr: 6 },
      { emoji: "🥛", name: "en mælk", priceInKr: 8 },
      { emoji: "🧀", name: "en ost", priceInKr: 10 },
      { emoji: "🍌", name: "en banan", priceInKr: 6 }
    ]
  }
};
var HOUSE = { name: "Hus", sign: "🏠", priceInKr: 50, roof: "#c0392b" };
var BUILD_ORDER = ["bageri", "apotek", "kobmand", "hus"];
var FURNITURE = {
  seng: { emoji: "🛏️", name: "Seng", priceInKr: 15, words: "Zzz… godnat 😴", sound: "klik" },
  sofa: { emoji: "🛋️", name: "Sofa", priceInKr: 15, words: "Hygge! 😊", sound: "klik" },
  fjernsyn: { emoji: "📺", name: "Fjernsyn", priceInKr: 20, words: "Tegnefilm! 📺", sound: "klik" },
  toilet: { emoji: "🚽", name: "Toilet", priceInKr: 10, words: "Ahh, det var godt! 😌", sound: "pop" },
  badekar: { emoji: "🛁", name: "Badekar", priceInKr: 20, words: "Plask plask! 💦", sound: "boing" },
  kokken: { emoji: "🍳", name: "Køkken", priceInKr: 25, words: "", sound: "hop" },
  service: { emoji: "🍽️", name: "Service", priceInKr: 5, words: "Gafler og knive 🍴", sound: "klik" },
  blomst: { emoji: "🌻", name: "Blomst", priceInKr: 5, words: "Den dufter godt 🌸", sound: "klik" }
};
var FURNITURE_ORDER = ["seng", "sofa", "fjernsyn", "toilet", "badekar", "kokken", "service", "blomst"];
var PETS = {
  hund: { emoji: "🐶", name: "Hund", priceInKr: 30, words: "Vov vov! 🐾" },
  kat: { emoji: "🐱", name: "Kat", priceInKr: 30, words: "Miav! 💕" },
  kanin: { emoji: "🐰", name: "Kanin", priceInKr: 25, words: "Hop hop! 🥕" },
  hamster: { emoji: "🐹", name: "Hamster", priceInKr: 20, words: "Pip pip! 🌰" },
  hest: { emoji: "🐴", name: "Hest", priceInKr: 60, words: "Vrinsk! 🐎" },
  fisk: { emoji: "🐠", name: "Fisk", priceInKr: 15, words: "Blub blub 💧" }
};
var PET_ORDER = ["hund", "kat", "kanin", "hamster", "hest", "fisk"];
var PET_FOOD = { emoji: "🦴", name: "Dyremad x5", priceInKr: 10, portions: 5 };
var HUNGRY_AT = 70;
var HUNGER_PER_SECOND = 100 / 180;
var ROOMS = [
  { key: "stue", name: "Stue", emoji: "🛋️", wall: "#f6e7c8", stripe: "#f1dcb3" },
  { key: "sovevaerelse", name: "Soveværelse", emoji: "🛏️", wall: "#e9e3f5", stripe: "#ddd3ef" },
  { key: "kokken", name: "Køkken", emoji: "🍳", wall: "#e6f4ea", stripe: "#d3ecd9" },
  { key: "badevaerelse", name: "Badeværelse", emoji: "🛁", wall: "#e3f2fb", stripe: "#cfe8f7" },
  { key: "dyrevaerelse", name: "Dyrenes værelse", emoji: "🐾", wall: "#fdf0d5", stripe: "#f9e2b0" }
];
var DISHES = ["🍝", "🍕", "🥞", "🍲", "🌮", "🥗"];
var FLOOR_TOP = 290;
var FLOOR_BOTTOM = 640;
var CUSTOMER_FACES = ["👩", "👨", "👵", "👴", "👦", "🧔", "👱‍♀️", "👲"];

var PLOT_WIDTH = 180;
var PLOT_HEIGHT = 150;
var plots = [
  { x: 60, y: 200 }, { x: 270, y: 200 }, { x: 570, y: 200 }, { x: 780, y: 200 },
  { x: 60, y: 470 }, { x: 270, y: 470 }, { x: 570, y: 470 }, { x: 780, y: 470 }
];
var trees = [
  { x: 40, y: 110 }, { x: 200, y: 120 }, { x: 430, y: 105 }, { x: 600, y: 115 }, { x: 860, y: 110 },
  { x: 990, y: 300 }, { x: 30, y: 720 }, { x: 250, y: 725 }, { x: 450, y: 715 }, { x: 700, y: 720 },
  { x: 990, y: 640 }
];

var player = { x: 512, y: 410, targetX: 512, targetY: 410 };
var money = 0;
var shops = [];
var coins = [];
var floaters = [];
var coinTimer = 0;
var menu = null;
var scene = "town";
var home = null;
var townSpot = null;
var dragging = null;
var pendingAction = null;
var speech = null;
var cooking = 0;
var petFollowers = [];
var roomIndex = 0;
var food = 0;

function setup() {
  var saved = load("state", null);
  if (saved) {
    money = saved.money;
    shops = saved.shops;
    food = saved.food || 0;
  }
  shops.forEach(function (shop) {
    shop.customer = null;
    shop.wait = random(2, 5);
    if (shop.type === "hus") {
      shop.rooms = shop.rooms || {};
      ROOMS.forEach(function (room) { shop.rooms[room.key] = shop.rooms[room.key] || []; });
      if (shop.furniture) { shop.rooms.stue = shop.rooms.stue.concat(shop.furniture); delete shop.furniture; }
      shop.pets = (shop.pets || []).map(function (pet) { return typeof pet === "string" ? { kind: pet, hunger: 0 } : pet; });
    }
  });
  rebuildFollowers();
  for (var i = 0; i < 5; i++) addCoin();
}

function remember() {
  save("state", {
    money: money,
    food: food,
    shops: shops.map(function (shop) {
      if (shop.type !== "hus") return { plot: shop.plot, type: shop.type };
      return { plot: shop.plot, type: shop.type, rooms: shop.rooms, pets: shop.pets };
    })
  });
}

function plotAt(x, y) {
  for (var i = 0; i < plots.length; i++) {
    var p = plots[i];
    if (x > p.x && x < p.x + PLOT_WIDTH && y > p.y && y < p.y + PLOT_HEIGHT) return i;
  }
  return -1;
}

function shopOnPlot(index) {
  for (var i = 0; i < shops.length; i++) if (shops[i].plot === index) return shops[i];
  return null;
}

function addCoin() {
  for (var tries = 0; tries < 20; tries++) {
    var x = random(40, WIDTH - 40);
    var y = random(110, HEIGHT - 40);
    if (plotAt(x, y) === -1) { coins.push({ x: x, y: y }); return; }
  }
}

function typeOf(shop) {
  return shop.type === "hus" ? HOUSE : SHOP_TYPES[shop.type];
}

function rebuildFollowers() {
  var old = petFollowers;
  petFollowers = [];
  shops.forEach(function (shop) {
    if (shop.type !== "hus") return;
    shop.pets.forEach(function (pet) {
      if (pet.kind === "fisk") return;
      var previous = old[petFollowers.length];
      petFollowers.push({ pet: pet, kind: pet.kind, x: previous ? previous.x : player.x, y: previous ? previous.y : player.y });
    });
  });
}

function furnitureHere() {
  return home.rooms[ROOMS[roomIndex].key];
}

function allPets() {
  var pets = [];
  shops.forEach(function (shop) { if (shop.type === "hus") pets = pets.concat(shop.pets); });
  return pets;
}

function feed(pets) {
  var hungry = pets.filter(function (pet) { return pet.hunger >= HUNGRY_AT; });
  var name = PETS[pets[0].kind].name.toLowerCase();
  if (hungry.length === 0) { say(PETS[pets[0].kind].words + " Jeg er mæt ❤️"); sfx("pop"); return; }
  if (food === 0) { say("Køb dyremad i Købmanden 🛒"); sfx("bump"); return; }
  food--;
  hungry.forEach(function (pet) { pet.hunger = 0; });
  say("Nam nam! Din " + name + " er glad ❤️");
  sfx("sejr");
  remember();
}

function say(words) {
  speech = { words: words, life: 2.2 };
}

function float(words, x, y, color) {
  floaters.push({ words: words, x: x, y: y, color: color, life: 1.2 });
}

function walk(dt) {
  var dx = player.targetX - player.x;
  var dy = player.targetY - player.y;
  var length = Math.sqrt(dx * dx + dy * dy);
  if (length > 4) {
    var step = Math.min(length, PLAYER_SPEED * dt);
    player.x += dx / length * step;
    player.y += dy / length * step;
  }
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

function updateInside(dt) {
  if (!dragging) walk(dt);
  followPets(dt);
  if (pendingAction && distance(player.x, player.y, pendingAction.x, pendingAction.y + 50) < 70) {
    useFurniture(pendingAction);
    pendingAction = null;
  }
  if (cooking > 0) {
    cooking -= dt;
    if (cooking <= 0) {
      var dish = DISHES[Math.floor(Math.random() * DISHES.length)];
      say("Mmm! " + dish + " 😋");
      sfx("sejr");
    }
  }
}

function useFurniture(item) {
  var kind = FURNITURE[item.kind];
  sfx(kind.sound);
  if (item.kind !== "kokken") { say(kind.words); return; }
  var hasService = ROOMS.some(function (room) {
    return home.rooms[room.key].some(function (other) { return other.kind === "service"; });
  });
  if (!hasService) { say("Jeg mangler service 🍽️"); return; }
  say("Jeg laver mad… 🍳");
  cooking = 1.6;
}

function update(dt) {
  for (var j = floaters.length - 1; j >= 0; j--) {
    floaters[j].life -= dt;
    floaters[j].y -= 40 * dt;
    if (floaters[j].life <= 0) floaters.splice(j, 1);
  }
  if (speech) { speech.life -= dt; if (speech.life <= 0) speech = null; }
  if (menu) return;
  allPets().forEach(function (pet) { pet.hunger = Math.min(100, pet.hunger + HUNGER_PER_SECOND * dt); });
  if (scene === "inside") { updateInside(dt); return; }

  walk(dt);
  followPets(dt);

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
  if (coinTimer > COIN_INTERVAL_IN_SECONDS) {
    coinTimer = 0;
    if (coins.length < MAX_COINS) addCoin();
  }

  shops.forEach(function (shop) {
    if (shop.customer || shop.type === "hus") return;
    shop.wait -= dt;
    if (shop.wait <= 0) {
      var type = SHOP_TYPES[shop.type];
      shop.customer = {
        face: CUSTOMER_FACES[Math.floor(Math.random() * CUSTOMER_FACES.length)],
        item: type.items[Math.floor(Math.random() * type.items.length)]
      };
      sfx("klik");
    }
  });
}

function drawWorld() {
  clear(theme.grass);
  box(0, 380, WIDTH, 60, theme.road);
  box(482, 70, 60, HEIGHT - 70, theme.road);
  for (var x = 10; x < WIDTH; x += 60) if (x < 470 || x > 545) box(x, 407, 30, 6, theme.line);
  for (var y = 80; y < HEIGHT; y += 60) if (y < 370 || y > 445) box(509, y, 6, 30, theme.line);
  trees.forEach(function (tree) { emoji("🌳", tree.x, tree.y, 64); });
}

function drawPlot(plot, index) {
  var shop = shopOnPlot(index);
  if (!shop) {
    box(plot.x, plot.y, PLOT_WIDTH, PLOT_HEIGHT, "rgba(255,255,255,0.18)");
    emoji("🚧", plot.x + PLOT_WIDTH / 2, plot.y + 60, 50);
    text("Byg her", plot.x + PLOT_WIDTH / 2, plot.y + 115, 24);
    return;
  }
  var type = typeOf(shop);
  box(plot.x + 10, plot.y + 40, PLOT_WIDTH - 20, PLOT_HEIGHT - 40, theme.brick);
  box(plot.x, plot.y + 10, PLOT_WIDTH, 34, type.roof);
  box(plot.x + 30, plot.y + 65, 45, 40, "#e6f4ff");
  box(plot.x + PLOT_WIDTH - 75, plot.y + 65, 45, 40, "#e6f4ff");
  box(plot.x + PLOT_WIDTH / 2 - 18, plot.y + 95, 36, 55, "#5a3825");
  text(shop.type === "hus" ? "Mit hus" : type.name, plot.x + PLOT_WIDTH / 2, plot.y + 27, 22);
  emoji(type.sign, plot.x + PLOT_WIDTH / 2, plot.y - 8, 40);
}

function drawCustomer(shop) {
  var plot = plots[shop.plot];
  var x = plot.x + PLOT_WIDTH / 2;
  var y = plot.y + PLOT_HEIGHT + 30;
  emoji(shop.customer.face, x, y, 54);
  box(x - 80, y - 110, 160, 60, "#fff");
  text("Må jeg få", x, y - 92, 18, "#222");
  emoji(shop.customer.item.emoji, x, y - 66, 26);
}

function drawChoice(x, y, symbol, name, priceInKr, color) {
  var canAfford = money >= priceInKr;
  box(x - 75, y - 75, 150, 150, canAfford ? color : "#cccccc");
  emoji(symbol, x, y - 22, 60);
  text(name, x, y + 30, 22, canAfford ? "#fff" : "#888");
  text(priceInKr + " kr", x, y + 58, 20, canAfford ? "#fff" : "#888");
}

function choiceX(i) {
  var perRow = Math.min(4, menu && menu.kind !== "sell" ? menuChoices().length : 4);
  return WIDTH / 2 + ((i % 4) - (perRow - 1) / 2) * 173;
}
function choiceY(i) { return 340 + Math.floor(i / 4) * 170; }

function menuChoices() {
  if (menu.kind === "build") return BUILD_ORDER.map(function (key) { return key === "hus" ? HOUSE : SHOP_TYPES[key]; });
  if (menu.kind === "furniture") return FURNITURE_ORDER.map(function (key) { return FURNITURE[key]; });
  if (menu.kind === "pets") return PET_ORDER.map(function (key) { return PETS[key]; }).concat([PET_FOOD]);
  if (menu.kind === "groceries") return [PET_FOOD];
  return [];
}

function drawMenu() {
  box(0, 0, WIDTH, HEIGHT, "rgba(0,0,0,0.55)");
  box(162, 134, 700, 520, "#fff8e7");
  box(790, 140, 64, 64, "#e2d6bd");
  text("✖️", 822, 172, 34);
  if (menu.kind === "sell") {
    var customer = menu.shop.customer;
    text(customer.face + " Må jeg få " + customer.item.name + "?", WIDTH / 2, 200, 34, "#222");
    text("Tryk på den rigtige ting", WIDTH / 2, 250, 24, "#555");
    SHOP_TYPES[menu.shop.type].items.forEach(function (item, i) {
      var x = 252 + i * 173;
      box(x - 75, 300, 150, 220, "#ffffff");
      emoji(item.emoji, x, 380, 80);
      text(item.priceInKr + " kr", x, 480, 28, "#222");
    });
    return;
  }
  var titles = { build: "Hvad vil du bygge?", furniture: "Hvilket møbel vil du købe?", pets: "Hvilket dyr vil du have?", groceries: "🛒 Købmanden" };
  var colors = { build: null, furniture: "#b7791f", pets: "#d53f8c", groceries: "#3182ce" };
  text(titles[menu.kind], WIDTH / 2, 190, 36, "#222");
  text("Du har " + money + " kr", WIDTH / 2, 232, 24, "#555");
  if (menu.kind === "groceries") text("Mad til dine dyr — fodr dem, når de er sultne 🍖", WIDTH / 2, 560, 22, "#555");
  menuChoices().forEach(function (choice, i) {
    drawChoice(choiceX(i), choiceY(i), choice.sign || choice.emoji, choice.name, choice.priceInKr, colors[menu.kind] || choice.roof);
  });
}

function drawSpeech(x, y) {
  if (!speech) return;
  if (!speech.width) { ctx.font = fontFor(24); speech.width = ctx.measureText(speech.words).width + 44; }
  var left = Math.max(10, Math.min(WIDTH - 10 - speech.width, x - speech.width / 2));
  box(left, y - 125, speech.width, 56, "#fff");
  text(speech.words, left + speech.width / 2, y - 97, 24, "#222");
}

function drawHungry(x, y) {
  box(x - 44, y - 30, 88, 30, "#fff");
  text("Sulten 🍖", x, y - 15, 16, "#c53030");
}

function drawPets() {
  petFollowers.forEach(function (pet) {
    var size = pet.kind === "hest" ? 80 : 46;
    emoji(PETS[pet.kind].emoji, pet.x, pet.y, size);
    if (pet.pet.hunger >= HUNGRY_AT) drawHungry(pet.x, pet.y - size / 2);
  });
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
  if (item.kind === "akvarium") {
    box(item.x - 90, item.y - 60, 180, 120, "#90cdf4");
    box(item.x - 90, item.y + 50, 180, 12, "#d69e2e");
    item.fish.forEach(function (pet, i) {
      emoji("🐠", item.x - 40 + i * 25 + Math.sin(Date.now() / 600 + i) * 25, item.y - 20 + (i % 3) * 25, 40);
    });
    if (item.fish.some(function (pet) { return pet.hunger >= HUNGRY_AT; })) drawHungry(item.x, item.y - 60);
    return;
  }
  emoji(FURNITURE[item.kind].emoji, item.x, item.y, 100);
}

function drawInside() {
  var room = ROOMS[roomIndex];
  box(0, 0, WIDTH, FLOOR_TOP, room.wall);
  for (var x = 0; x < WIDTH; x += 80) box(x, 0, 40, FLOOR_TOP, room.stripe);
  box(0, FLOOR_TOP, WIDTH, HEIGHT - FLOOR_TOP, "#c08a52");
  for (var y = FLOOR_TOP + 50; y < HEIGHT; y += 50) box(0, y, WIDTH, 3, "#a87443");
  box(0, FLOOR_TOP - 12, WIDTH, 12, "#8b5a2b");
  box(380, 60, 260, 150, "#bee3f8");
  box(505, 60, 10, 150, "#fff");
  box(380, 130, 260, 10, "#fff");
  text(room.emoji + " " + room.name + "  " + (roomIndex + 1) + "/" + ROOMS.length, WIDTH / 2, 30, 30, "#5a3825");

  var everything = furnitureHere().slice();
  var tank = aquarium();
  if (tank) everything.push(tank);
  everything.sort(function (a, b) { return a.y - b.y; });
  everything.forEach(drawFurniture);
  if (everything.length === 0) text("Tryk på 🛒 Møbler for at købe møbler", WIDTH / 2, 420, 26, "#fff");

  drawPets();
  emoji("👧", player.x, player.y, 70);
  drawSpeech(player.x, player.y);

  bigButton(12, 400, 90, 120, "⬅️", "#8b5a2b");
  bigButton(WIDTH - 102, 400, 90, 120, "➡️", "#8b5a2b");
  box(0, 660, WIDTH, 108, "rgba(0,0,0,0.25)");
  bigButton(150, 672, 220, 84, "🛒 Møbler", "#b7791f");
  bigButton(402, 672, 220, 84, "🐾 Dyr", "#d53f8c");
  bigButton(654, 672, 220, 84, "🚪 Gå ud", "#2f855a");
}

function bigButton(x, y, width, height, label, color) {
  box(x, y + 5, width, height, "rgba(0,0,0,0.3)");
  box(x, y, width, height, color);
  text(label, x + width / 2, y + height / 2, 28);
}

function draw() {
  if (scene === "inside") {
    drawInside();
    floaters.forEach(function (f) { text(f.words, f.x, f.y, 28, f.color); });
    box(WIDTH - 230, 12, 210, 56, "rgba(0,0,0,0.35)");
    text("💰 " + money + " kr", WIDTH - 125, 40, 32);
    box(WIDTH - 230, 74, 210, 46, "rgba(0,0,0,0.25)");
    text("🦴 Dyremad: " + food, WIDTH - 125, 97, 22);
    if (menu) drawMenu();
    return;
  }
  drawWorld();
  plots.forEach(drawPlot);
  coins.forEach(function (coin) {
    circle(coin.x, coin.y, 16, "#c99a06");
    circle(coin.x, coin.y, 12, "#ffd34e");
  });
  drawPets();
  emoji("👧", player.x, player.y, 60);
  drawSpeech(player.x, player.y);
  shops.forEach(function (shop) { if (shop.customer) drawCustomer(shop); });
  floaters.forEach(function (f) { text(f.words, f.x, f.y, 28, f.color); });
  box(WIDTH - 230, 12, 210, 56, "rgba(0,0,0,0.35)");
  text("💰 " + money + " kr", WIDTH - 125, 40, 32);
  if (menu) drawMenu();
}

function buy(priceInKr) {
  if (money < priceInKr) { sfx("bump"); float("Du mangler " + (priceInKr - money) + " kr", WIDTH / 2, 610, "#fff"); return false; }
  money -= priceInKr;
  return true;
}

function tapMenu(x, y) {
  if (x > 770 && x < 870 && y > 120 && y < 220) { menu = null; return; }
  if (x < 162 || x > 862 || y < 134 || y > 654) { menu = null; return; }
  if (menu.kind !== "sell") {
    var picked = -1;
    menuChoices().forEach(function (choice, i) {
      if (Math.abs(x - choiceX(i)) < 75 && Math.abs(y - choiceY(i)) < 75) picked = i;
    });
    if (picked === -1) return;
    var choice = menuChoices()[picked];
    if (!buy(choice.priceInKr)) return;
    if (menu.kind === "build") {
      var key = BUILD_ORDER[picked];
      var built = { plot: menu.plot, type: key, customer: null, wait: random(2, 4) };
      if (key === "hus") { built.furniture = []; built.pets = []; }
      shops.push(built);
      var plot = plots[menu.plot];
      float(key === "hus" ? "Dit nye hus! 🎉" : "Nyt " + choice.name.toLowerCase() + "! 🎉", plot.x + PLOT_WIDTH / 2, plot.y, "#fff");
      sfx("boing");
    } else if (menu.kind === "furniture") {
      var spot = freeSpot();
      furnitureHere().push({ kind: FURNITURE_ORDER[picked], x: spot.x, y: spot.y });
      say("Nyt møbel! Træk det hen hvor du vil 👆");
      sfx("boing");
    } else if (menu.kind === "groceries" || picked === PET_ORDER.length) {
      food += PET_FOOD.portions;
      say("Nu har du " + food + " portioner dyremad 🦴");
      sfx("mont");
    } else {
      var kind = PET_ORDER[picked];
      home.pets.push({ kind: kind, hunger: 0 });
      rebuildFollowers();
      say(kind === "fisk" ? "Fisken bor i Dyrenes værelse 🐠" : PETS[kind].words);
      sfx("boing");
    }
    remember();
    menu = null;
    return;
  }
  if (y < 300 || y > 520) return;
  var shop = menu.shop;
  SHOP_TYPES[shop.type].items.forEach(function (item, i) {
    var center = 252 + i * 173;
    if (Math.abs(x - center) < 75) {
      var plot = plots[shop.plot];
      if (item === shop.customer.item) {
        money += item.priceInKr;
        float("Tak! +" + item.priceInKr + " kr", plot.x + PLOT_WIDTH / 2, plot.y + PLOT_HEIGHT, "#ffd34e");
        shop.customer = null;
        shop.wait = random(4, 9);
        sfx("sejr");
        remember();
        menu = null;
      } else {
        sfx("bump");
        float("Nej, det var ikke det 😅", WIDTH / 2, 600, "#fff");
      }
    }
  });
}

function aquarium() {
  if (ROOMS[roomIndex].key !== "dyrevaerelse") return null;
  var fish = home.pets.filter(function (pet) { return pet.kind === "fisk"; });
  if (fish.length === 0) return null;
  return { kind: "akvarium", x: 820, y: 210, fish: fish };
}

function freeSpot() {
  for (var row = 0; row < 3; row++) {
    for (var column = 0; column < 5; column++) {
      var x = 200 + column * 155;
      var y = FLOOR_TOP + 70 + row * 130;
      var taken = furnitureHere().some(function (item) { return Math.abs(item.x - x) < 130 && Math.abs(item.y - y) < 110; });
      if (!taken) return { x: x, y: y };
    }
  }
  return { x: random(200, 820), y: random(FLOOR_TOP + 70, FLOOR_BOTTOM - 40) };
}

function furnitureAt(x, y) {
  var top = null;
  furnitureHere().forEach(function (item) {
    if (Math.abs(x - item.x) < 70 && Math.abs(y - item.y) < 60 && (!top || item.y >= top.y)) top = item;
  });
  return top;
}

function petAt(x, y) {
  for (var i = 0; i < petFollowers.length; i++) {
    if (distance(x, y, petFollowers[i].x, petFollowers[i].y) < 45) return petFollowers[i];
  }
  return null;
}

function goInside(house) {
  home = house;
  roomIndex = 0;
  townSpot = { x: player.x, y: player.y };
  player.x = player.targetX = 512;
  player.y = player.targetY = 600;
  petFollowers.forEach(function (pet, i) { pet.x = 512 - 55 * (i + 1); pet.y = 620; });
  scene = "inside";
  sfx("klik");
}

function goOutside() {
  scene = "town";
  player.x = player.targetX = townSpot.x;
  player.y = player.targetY = townSpot.y;
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
  if (y > 400 && y < 520 && (x < 102 || x > WIDTH - 102)) {
    roomIndex = (roomIndex + (x < 102 ? -1 : 1) + ROOMS.length) % ROOMS.length;
    pendingAction = null;
    sfx("klik");
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

  var pet = petAt(x, y);
  if (pet) { feed([pet.pet]); float("❤️", pet.x, pet.y - 40, "#fff"); return; }

  for (var i = 0; i < shops.length; i++) {
    var shop = shops[i];
    if (!shop.customer) continue;
    var plot = plots[shop.plot];
    var cx = plot.x + PLOT_WIDTH / 2;
    var cy = plot.y + PLOT_HEIGHT + 30;
    if (Math.abs(x - cx) < 85 && y > cy - 115 && y < cy + 35) { menu = { kind: "sell", shop: shop }; return; }
  }

  var index = plotAt(x, y);
  if (index !== -1) {
    var onPlot = shopOnPlot(index);
    if (!onPlot) { menu = { kind: "build", plot: index }; return; }
    if (onPlot.type === "hus") { goInside(onPlot); return; }
    if (onPlot.type === "kobmand" && !onPlot.customer) { menu = { kind: "groceries" }; sfx("klik"); return; }
    if (onPlot.customer) { menu = { kind: "sell", shop: onPlot }; return; }
  }

  player.targetX = x;
  player.targetY = Math.max(90, y);
}
