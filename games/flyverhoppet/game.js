useFont("racer");

var theme = { sky: "#5fb4f0", horizon: "#a9d8fb", grass: "#5f9e4a", concrete: "#a3a3a8", edge: "#5c5c62", text: "#fff" };

var GRAVITY = 900;
var GAS_POWER = 320;
var TURBO_BOOST = 450;
var TURBOS_PER_RUN = 3;
var FLIP_SPEED = 6;
var GROUND_Y = 760;
var RAMP_STEP = 10;
var RAMP_END_X = 3000;
var RAMP_CURVE_START_X = 2200;
var UNITS_PER_METER = 10;
var METERS_PER_FLIP = 10;
var PARKED_CAR_SPACING = 150;
var PARKED_CAR_COUNT = 200;

var COLORS = ["#d7262e", "#1f6feb", "#f2c200", "#1a1a1a", "#f5f5f5", "#2f9e44", "#f76707", "#ae3ec9"];
var STYLES = [
  { key: "sport", name: "Sportsvogn", priceInKr: 0, power: 1, speed: 5 },
  { key: "jeep", name: "Jeep", priceInKr: 60, power: 1.15, speed: 6 },
  { key: "racer", name: "Racerbil", priceInKr: 150, power: 1.3, speed: 7 },
  { key: "super", name: "Superbil", priceInKr: 300, power: 1.55, speed: 9 }
];
var PARACHUTE_PRICE_IN_KR = 80;
var METERS_PER_KR = 10;
var CHUTE_FALL_SPEED = 120;
var wallet = { money: 0, owned: ["sport"], parachute: false };
var PARKED_COLORS = ["#c0c0c8", "#2b4c7e", "#8b1e1e", "#e8e8e8", "#3a3a3a", "#5b7f3a", "#d9c27a"];

var rampHeights = [];
var lip = { x: RAMP_END_X, y: 0, angle: 0 };
var clouds = [];
var parkedCars = [];

var RAINBOW = "rainbow";
var RAINBOW_STRIPES = ["#e03131", "#f76707", "#fcc419", "#2f9e44", "#1c7ed6", "#7048e8"];
var BADGES = ["A", "★", "♥", "Ω", "∞", "@", "?", "✿"];
var GARAGE_TABS = [
  { key: "color", name: "🚗 Bil" },
  { key: "badge", name: "🔣 Mærke" },
  { key: "badgeColor", name: "🎨 Mærkefarve" },
  { key: "wheelColor", name: "⚙️ Hjul" }
];
var DEFAULT_SETTINGS = { color: COLORS[0], style: "sport", badge: "A", badgeColor: COLORS[0], wheelColor: "#c0c0c8" };
var settings = DEFAULT_SETTINGS;
var garageTab = "color";
var record = 0;
var phase = "garage";
var car = null;
var camera = { x: 0, y: 0 };
var buttons = { gas: false, flip: false };
var result = null;
var resultTimer = 0;

function buildRamp() {
  var y = -900;
  for (var x = 0; x <= RAMP_END_X; x += RAMP_STEP) {
    rampHeights.push(y);
    var slope = x < RAMP_CURVE_START_X ? 0.6 : 0.6 - 1.4 * (x - RAMP_CURVE_START_X) / (RAMP_END_X - RAMP_CURVE_START_X);
    y += slope * RAMP_STEP;
  }
  var last = rampHeights.length - 1;
  lip.y = rampHeights[last];
  lip.angle = Math.atan2(rampHeights[last] - rampHeights[last - 1], RAMP_STEP);
}

function rampY(x) {
  var i = Math.max(0, Math.min(rampHeights.length - 2, Math.floor(x / RAMP_STEP)));
  var t = (x - i * RAMP_STEP) / RAMP_STEP;
  return rampHeights[i] + (rampHeights[i + 1] - rampHeights[i]) * t;
}

function rampAngle(x) {
  return Math.atan2(rampY(x + 5) - rampY(x - 5), 10);
}

function setup() {
  buildRamp();
  for (var i = 0; i < 14; i++) clouds.push({ x: random(0, 5000), y: random(-500, 350), size: random(0.6, 1.3) });
  for (var j = 0; j < PARKED_CAR_COUNT; j++) {
    parkedCars.push({
      x: RAMP_END_X + 250 + j * PARKED_CAR_SPACING,
      color: PARKED_COLORS[j % PARKED_COLORS.length],
      style: j % 5 === 2 ? "jeep" : "sedan"
    });
  }
  wallet = load("wallet", wallet);
  var saved = load("settings", {});
  settings = {};
  Object.keys(DEFAULT_SETTINGS).forEach(function (key) {
    settings[key] = saved[key] === undefined ? DEFAULT_SETTINGS[key] : saved[key];
  });
  if (wallet.owned.indexOf(settings.style) === -1) wallet.owned.push(settings.style);
  record = load("record", 0);
}

function startRun() {
  car = { x: 40, y: rampY(40), speed: 0, vx: 0, vy: 0, angle: rampAngle(40), spin: 0, turbos: TURBOS_PER_RUN, flame: 0 };
  buttons.gas = false;
  buttons.flip = false;
  phase = "ramp";
}

function styleOf(key) {
  for (var i = 0; i < STYLES.length; i++) if (STYLES[i].key === key) return STYLES[i];
  return STYLES[0];
}

function drawChute(x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-50, -40); ctx.lineTo(-80, -150);
  ctx.moveTo(50, -40); ctx.lineTo(80, -150);
  ctx.moveTo(0, -45); ctx.lineTo(0, -160);
  ctx.stroke();
  ["#e03131", "#fcc419", "#1c7ed6", "#2f9e44"].forEach(function (color, i) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -150);
    ctx.arc(0, -150, 100, Math.PI + i * Math.PI / 4, Math.PI + (i + 1) * Math.PI / 4);
    ctx.closePath();
    ctx.fill();
  });
  ctx.restore();
}

function finish(goodLanding) {
  var flips = Math.floor(Math.abs(car.spin) / (Math.PI * 2) + 0.15);
  var meters = Math.round((car.x - lip.x) / UNITS_PER_METER);
  if (goodLanding) meters += flips * METERS_PER_FLIP;
  var passed = 0;
  parkedCars.forEach(function (parked) { if (parked.x < car.x) passed++; });
  var earned = Math.max(1, Math.round(meters / METERS_PER_KR));
  wallet.money += earned;
  save("wallet", wallet);
  var isRecord = meters > record;
  if (isRecord) { record = meters; save("record", record); }
  result = { meters: meters, flips: flips, good: goodLanding, passed: passed, isRecord: isRecord, earned: earned };
  sfx(goodLanding ? "bump" : "tab");
  if (isRecord) setTimeout(function () { sfx("sejr"); }, 400);
  phase = "landed";
  resultTimer = 1.2;
}

function update(dt) {
  if (phase === "ramp") {
    var angle = rampAngle(car.x);
    car.speed += GRAVITY * Math.sin(angle) * dt;
    if (buttons.gas) car.speed += GAS_POWER * styleOf(settings.style).power * dt;
    car.speed *= 1 - 0.05 * dt;
    if (car.speed < 0) car.speed = 0;
    car.x += car.speed * Math.cos(angle) * dt;
    car.y = rampY(car.x);
    car.angle = angle;
    if (car.x >= lip.x) {
      car.vx = car.speed * Math.cos(lip.angle);
      car.vy = car.speed * Math.sin(lip.angle);
      phase = "air";
    }
  } else if (phase === "air") {
    car.vy += GRAVITY * dt;
    if (car.chute) {
      car.vy = Math.min(car.vy, CHUTE_FALL_SPEED);
      car.vx *= 1 - 0.12 * dt;
      car.angle += (0 - Math.atan2(Math.sin(car.angle), Math.cos(car.angle))) * Math.min(1, 3 * dt);
    }
    car.x += car.vx * dt;
    car.y += car.vy * dt;
    if (buttons.flip && !car.chute) { car.angle -= FLIP_SPEED * dt; car.spin -= FLIP_SPEED * dt; }
    if (car.y >= GROUND_Y) {
      car.y = GROUND_Y;
      var tilt = Math.atan2(Math.sin(car.angle), Math.cos(car.angle));
      var good = Math.abs(tilt) < 0.7;
      car.angle = good ? 0 : Math.PI;
      car.speed = good ? car.vx * 0.6 : car.vx * 0.2;
      finish(good);
    }
  } else if (phase === "landed") {
    car.speed *= 1 - 2 * dt;
    car.x += car.speed * dt;
    resultTimer -= dt;
  }

  if (car) {
    car.flame = Math.max(0, car.flame - dt);
    camera.x = car.x - 300;
    camera.y = Math.min(car.y - 420, GROUND_Y - 700);
  }
}

// ---- Drawing ----

function shape(points, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(points[0], points[1]);
  for (var i = 2; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1]);
  ctx.closePath();
  ctx.fill();
}

var BODIES = {
  sport: { body: [-62, 0, -60, -16, -40, -20, -18, -36, 14, -36, 38, -22, 64, -16, 66, 0], window: [-14, -32, 12, -32, 30, -21, -32, -21], wheelY: 2, wheel: 12 },
  racer: { body: [-66, 0, -66, -14, -56, -14, -56, -24, -48, -24, -46, -16, -20, -18, -6, -30, 16, -30, 30, -16, 66, -10, 68, 0], window: [-4, -27, 14, -27, 24, -17, -14, -17], wheelY: 2, wheel: 13 },
  jeep: { body: [-58, 0, -58, -30, -40, -32, -36, -52, 26, -52, 30, -32, 58, -30, 60, 0], window: [-30, -48, -4, -48, -4, -33, -32, -33], window2: [2, -48, 22, -48, 25, -33, 2, -33], wheelY: 4, wheel: 15 },
  super: { body: [-66, 0, -66, -12, -50, -16, -56, -28, -46, -28, -40, -18, -10, -22, 4, -30, 24, -30, 44, -16, 68, -8, 70, 0], window: [6, -27, 22, -27, 36, -17, -4, -19], wheelY: 2, wheel: 13 },
  sedan: { body: [-60, 0, -60, -18, -36, -22, -20, -40, 22, -40, 40, -22, 60, -18, 62, 0], window: [-16, -36, 0, -36, 0, -23, -30, -23], window2: [4, -36, 20, -36, 34, -23, 4, -23], wheelY: 2, wheel: 12 }
};

function fillRainbow(left, top, width, height) {
  var stripe = height / RAINBOW_STRIPES.length;
  RAINBOW_STRIPES.forEach(function (color, i) { box(left, top + i * stripe, width, stripe + 1, color); });
}

var badgeGradient = null;
function rainbowGradient() {
  if (!badgeGradient) {
    badgeGradient = ctx.createLinearGradient(0, -16, 0, -3);
    RAINBOW_STRIPES.forEach(function (color, i) {
      badgeGradient.addColorStop(i / RAINBOW_STRIPES.length, color);
      badgeGradient.addColorStop((i + 1) / RAINBOW_STRIPES.length, color);
    });
  }
  return badgeGradient;
}

function paint(points, color, top, height) {
  if (color !== RAINBOW) { shape(points, color); return; }
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(points[0], points[1]);
  for (var i = 2; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1]);
  ctx.closePath();
  ctx.clip();
  fillRainbow(-80, top, 160, height);
  ctx.restore();
}

function drawWheel(x, y, radius, color) {
  circle(x, y, radius, "#111");
  if (color !== RAINBOW) { circle(x, y, radius * 0.5, color); return; }
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.5, 0, Math.PI * 2);
  ctx.clip();
  fillRainbow(x - radius, y - radius * 0.5, radius * 2, radius);
  ctx.restore();
}

function drawCar(x, y, angle, style, color, scale, looks) {
  var model = BODIES[style];
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.translate(0, -model.wheel);
  paint(model.body, color, -54, 56);
  shape(model.window, "#22313f");
  if (model.window2) shape(model.window2, "#22313f");
  if (style === "racer") box(-66, -26, 14, 4, "#111");
  box(58, -12, 8, 5, "#fff2a8");
  box(-62, -12, 5, 6, "#ff3b3b");
  if (looks) {
    circle(6, -10, 9, looks.badgeColor === "#f5f5f5" ? "#222" : "#fff");
    ctx.fillStyle = looks.badgeColor === RAINBOW ? rainbowGradient() : looks.badgeColor;
    ctx.font = "bold 13px -apple-system, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(looks.badge, 6, -9);
  }
  var wheelColor = looks ? looks.wheelColor : "#c0c0c8";
  drawWheel(-36, model.wheelY, model.wheel, wheelColor);
  drawWheel(38, model.wheelY, model.wheel, wheelColor);
  ctx.restore();
}

function drawCloud(x, y, size) {
  circle(x, y, 40 * size, "#fff");
  circle(x + 40 * size, y - 18 * size, 50 * size, "#fff");
  circle(x + 85 * size, y, 38 * size, "#fff");
  box(x, y, 85 * size, 38 * size, "#fff");
}

function drawSky() {
  clear(theme.sky);
  box(0, HEIGHT * 0.55, WIDTH, HEIGHT * 0.45, theme.horizon);
  circle(880, 110, 60, "#fff6c2");
  clouds.forEach(function (cloud) {
    var x = ((cloud.x - camera.x * 0.3) % 5000 + 5000) % 5000 - 300;
    var y = cloud.y - camera.y * 0.3;
    if (x > -250 && x < WIDTH + 50 && y > -100 && y < HEIGHT + 100) drawCloud(x, y, cloud.size);
  });
}

function drawWorld() {
  ctx.save();
  ctx.translate(-Math.round(camera.x), -Math.round(camera.y));
  var left = camera.x - 100;
  var right = camera.x + WIDTH + 100;

  box(left, GROUND_Y, right - left, 400, theme.grass);
  box(left, GROUND_Y, right - left, 14, "#4a8038");

  if (left < RAMP_END_X) {
    var start = Math.max(0, Math.floor(left / RAMP_STEP) * RAMP_STEP);
    var end = Math.min(RAMP_END_X, right);
    ctx.fillStyle = "#8e8e94";
    ctx.beginPath();
    ctx.moveTo(start, GROUND_Y);
    for (var x = start; x <= end; x += RAMP_STEP * 2) ctx.lineTo(x, rampY(x));
    ctx.lineTo(end, rampY(end));
    ctx.lineTo(end, GROUND_Y);
    ctx.closePath();
    ctx.fill();
    for (var px = 0; px < RAMP_END_X; px += 150) {
      if (px > left - 20 && px < right) box(px, rampY(px) + 34, 10, GROUND_Y - rampY(px) - 34, "#7a7a80");
    }
    ctx.strokeStyle = theme.concrete;
    ctx.lineWidth = 34;
    ctx.beginPath();
    ctx.moveTo(start, rampY(start) + 17);
    for (var x2 = start; x2 <= end; x2 += RAMP_STEP * 2) ctx.lineTo(x2, rampY(x2) + 17);
    ctx.stroke();
    ctx.strokeStyle = theme.edge;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(start, rampY(start));
    for (var x3 = start; x3 <= end; x3 += RAMP_STEP * 2) ctx.lineTo(x3, rampY(x3));
    ctx.stroke();
    if (right > RAMP_END_X - 40) {
      for (var stripe = lip.y + 10; stripe < GROUND_Y; stripe += 50) box(RAMP_END_X - 8, stripe, 8, 25, "#ffcc00");
    }
    if (left < 80) text("START", 60, rampY(60) - 90, 30, "#fff");
  }

  for (var m = 50; m < 3000; m += 50) {
    var markX = lip.x + m * UNITS_PER_METER;
    if (markX > left && markX < right) {
      box(markX - 3, GROUND_Y - 70, 6, 70, "#fff");
      box(markX - 40, GROUND_Y - 100, 80, 34, "#fff");
      text(m + " m", markX, GROUND_Y - 83, 20, "#222");
    }
  }

  parkedCars.forEach(function (parked) {
    if (parked.x > left - 80 && parked.x < right + 80) drawCar(parked.x, GROUND_Y, 0, parked.style, parked.color, 0.9, null);
  });

  if (car) {
    if (car.flame > 0) {
      ctx.save();
      ctx.translate(car.x, car.y);
      ctx.rotate(car.angle);
      circle(-80, -16, 18 + car.flame * 20, "#ff9f1c");
      circle(-74, -16, 10 + car.flame * 10, "#ffe066");
      ctx.restore();
    }
    if (car.chute) drawChute(car.x, car.y - 20, car.angle);
    drawCar(car.x, car.y, car.angle, settings.style, settings.color, 1.1, settings);
  }
  ctx.restore();
}

function roundButton(x, y, radius, label, sub, color, pressed) {
  circle(x, y + 6, radius, "rgba(0,0,0,0.3)");
  circle(x, y + (pressed ? 6 : 0), radius, color);
  text(label, x, y - 10 + (pressed ? 6 : 0), 44);
  text(sub, x, y + 34 + (pressed ? 6 : 0), 20);
}

function drawHud() {
  if (phase === "ramp") {
    roundButton(900, 640, 90, "⛽️", "Gas", "#2f9e44", buttons.gas);
    roundButton(124, 640, 90, "🔥", "Turbo " + car.turbos, car.turbos > 0 ? "#f76707" : "#999", false);
  }
  if (phase === "air") {
    roundButton(900, 640, 90, "🤸", "Salto", car.chute ? "#999" : "#1f6feb", buttons.flip);
    if (wallet.parachute) roundButton(124, 640, 90, "☂️", car.chute ? "Åben!" : "Faldskærm", car.chute ? "#999" : "#e03131", false);
    var flown = Math.max(0, Math.round((car.x - lip.x) / UNITS_PER_METER));
    box(WIDTH / 2 - 110, 16, 220, 60, "rgba(0,0,0,0.35)");
    text(flown + " m", WIDTH / 2, 46, 36);
  }
  if (phase === "ramp" || phase === "air") {
    box(WIDTH - 240, 16, 220, 50, "rgba(0,0,0,0.35)");
    text("🏆 Rekord: " + record + " m", WIDTH - 130, 41, 22);
  }
  if (phase === "landed" && resultTimer <= 0) drawResult();
}

function bigButton(x, y, width, height, label, color) {
  box(x, y + 6, width, height, "rgba(0,0,0,0.3)");
  box(x, y, width, height, color);
  text(label, x + width / 2, y + height / 2, 32);
}

function drawResult() {
  box(0, 0, WIDTH, HEIGHT, "rgba(0,0,0,0.45)");
  box(212, 110, 600, 540, "#fff8e7");
  text(result.isRecord ? "🏆 NY REKORD! 🏆" : "🏁 Du fløj", WIDTH / 2, 170, 40, "#222");
  text(result.meters + " m", WIDTH / 2, 250, 80, "#d7262e");
  text(result.good ? "Flot landing! 👍" : "Av! Bilen landede skævt 🙃", WIDTH / 2, 330, 28, "#444");
  if (result.flips > 0) text("🤸 " + result.flips + " salto" + (result.flips > 1 ? "er" : "") + (result.good ? " (+" + result.flips * METERS_PER_FLIP + " m)" : ""), WIDTH / 2, 375, 26, "#444");
  text("Du fløj over " + result.passed + " biler 🚗", WIDTH / 2, 420, 26, "#444");
  text("💰 +" + result.earned + " kr  ·  Rekord: " + record + " m", WIDTH / 2, 462, 24, "#2f9e44");
  bigButton(262, 520, 230, 90, "🔁 Igen", "#2f9e44");
  bigButton(532, 520, 230, 90, "🎨 Garage", "#1f6feb");
}

function garageOptions() {
  if (garageTab === "badge") return BADGES;
  if (garageTab === "badgeColor") return COLORS.concat([RAINBOW]);
  return COLORS.concat([RAINBOW]);
}

function optionX(i) {
  return WIDTH / 2 + (i - (garageOptions().length - 1) / 2) * 100;
}

function drawSwatch(x, y, color) {
  if (color !== RAINBOW) { circle(x, y, 36, color); return; }
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, 36, 0, Math.PI * 2);
  ctx.clip();
  fillRainbow(x - 36, y - 36, 72, 72);
  ctx.restore();
}

function styleX(i) { return 100 + i * 172; }

function drawGarage() {
  clear("#3b3f4a");
  box(0, 410, WIDTH, 358, "#2a2d35");
  text("🎨 Garage", WIDTH / 2, 50, 44);
  text("🏆 Rekord: " + record + " m", WIDTH - 130, 50, 22);
  drawCar(WIDTH / 2, 370, 0, settings.style, settings.color, 2.6, settings);

  GARAGE_TABS.forEach(function (tab, i) {
    var x = 112 + i * 205;
    var active = tab.key === garageTab;
    box(x, 425, 195, 64, active ? "#ffd34e" : "#555a66");
    text(tab.name, x + 97, 457, 22, active ? "#222" : "#fff");
  });

  garageOptions().forEach(function (option, i) {
    var x = optionX(i);
    if (option === settings[garageTab]) circle(x, 555, 44, "#ffd34e");
    if (garageTab === "badge") {
      circle(x, 555, 36, "#fff");
      ctx.fillStyle = settings.badgeColor === RAINBOW ? "#e03131" : settings.badgeColor === "#f5f5f5" ? "#222" : settings.badgeColor;
      ctx.font = "bold 40px -apple-system, Helvetica, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (settings.badgeColor === RAINBOW) {
        ctx.save(); ctx.translate(x, 556); ctx.scale(3, 3); ctx.translate(0, 9);
        ctx.fillStyle = rainbowGradient();
        ctx.font = "bold 13px -apple-system, Helvetica, sans-serif";
        ctx.fillText(option, 0, -9);
        ctx.restore();
      } else {
        ctx.fillText(option, x, 556);
      }
    } else {
      drawSwatch(x, 555, option);
    }
  });

  STYLES.forEach(function (style, i) {
    var x = styleX(i);
    var owned = wallet.owned.indexOf(style.key) !== -1;
    var selected = style.key === settings.style;
    box(x - 82, 622, 164, 92, selected ? "#ffd34e" : owned ? "#555a66" : "#3a3d48");
    text(style.name, x, 646, 22, selected ? "#222" : "#fff");
    text("⚡ Fart " + style.speed, x, 674, 17, selected ? "#444" : "#cfd3dc");
    text(owned ? (selected ? "✔ Valgt" : "Din") : style.priceInKr + " kr", x, 700, 18, selected ? "#222" : owned ? "#9ae6b4" : wallet.money >= style.priceInKr ? "#ffd34e" : "#999");
  });
  text("💰 " + wallet.money + " kr", WIDTH / 2, 100, 30, "#ffd34e");
  var chuteColor = wallet.parachute ? "#2f9e44" : wallet.money >= PARACHUTE_PRICE_IN_KR ? "#e03131" : "#555a66";
  box(WIDTH - 262, 80, 250, 70, chuteColor);
  text(wallet.parachute ? "☂️ Faldskærm ✔" : "☂️ Faldskærm · " + PARACHUTE_PRICE_IN_KR + " kr", WIDTH - 137, 115, 20);
  bigButton(800, 620, 190, 90, "Kør! 🏁", "#2f9e44");
}

function draw() {
  if (phase === "garage") { drawGarage(); return; }
  drawSky();
  drawWorld();
  drawHud();
}

// ---- Touch ----

function inside(x, y, left, top, width, height) {
  return x > left && x < left + width && y > top && y < top + height;
}

function onTap(x, y) {
  if (phase === "garage") {
    GARAGE_TABS.forEach(function (tab, i) {
      if (inside(x, y, 112 + i * 205, 425, 195, 64)) { garageTab = tab.key; sfx("klik"); }
    });
    garageOptions().forEach(function (option, i) {
      if (distance(x, y, optionX(i), 555) < 46) { settings[garageTab] = option; sfx("klik"); save("settings", settings); }
    });
    STYLES.forEach(function (style, i) {
      if (!inside(x, y, styleX(i) - 82, 622, 164, 92)) return;
      if (wallet.owned.indexOf(style.key) === -1) {
        if (wallet.money < style.priceInKr) { sfx("bump"); return; }
        wallet.money -= style.priceInKr;
        wallet.owned.push(style.key);
        save("wallet", wallet);
        sfx("sejr");
      } else {
        sfx("klik");
      }
      settings.style = style.key;
      save("settings", settings);
    });
    if (inside(x, y, WIDTH - 262, 80, 250, 70) && !wallet.parachute) {
      if (wallet.money < PARACHUTE_PRICE_IN_KR) { sfx("bump"); return; }
      wallet.money -= PARACHUTE_PRICE_IN_KR;
      wallet.parachute = true;
      save("wallet", wallet);
      sfx("sejr");
    }
    if (inside(x, y, 800, 620, 190, 90)) { sfx("hop"); startRun(); }
    return;
  }
  if (phase === "ramp") {
    if (distance(x, y, 900, 640) < 100) buttons.gas = true;
    if (distance(x, y, 124, 640) < 100 && car.turbos > 0) {
      car.turbos--;
      car.speed += TURBO_BOOST;
      car.flame = 0.8;
      sfx("eksplosion");
    }
    return;
  }
  if (phase === "air") {
    if (distance(x, y, 900, 640) < 100) buttons.flip = true;
    if (wallet.parachute && !car.chute && distance(x, y, 124, 640) < 100) { car.chute = true; buttons.flip = false; sfx("pop"); }
    return;
  }
  if (phase === "landed" && resultTimer <= 0) {
    if (inside(x, y, 262, 520, 230, 90)) { sfx("hop"); startRun(); }
    if (inside(x, y, 532, 520, 230, 90)) { sfx("klik"); phase = "garage"; }
  }
}

function onRelease(x, y) {
  if (distance(x, y, 900, 640) < 140) { buttons.gas = false; buttons.flip = false; }
}
