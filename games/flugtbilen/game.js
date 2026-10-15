useFont("racer");
window.HI_RES = true;
window.ADAPTIVE = true;
window.USES_PLAYERS = true;

var BLOCKS = 6;
var BLOCK = 520;
var ROAD = 180;
var STEP = BLOCK + ROAD;
var WORLD = BLOCKS * STEP + ROAD;
var CAR_RADIUS = 30;
var START_LIVES = 5;
var HIT_COOLDOWN_IN_SECONDS = 1.5;
var RAMP_SPEED = 250;
var CATCH_REWARD_IN_KR = 150;
var ROBBER_COUNT = 10;
var HELPER_COUNT = 4;
var MAX_PRISONERS = 3;

var CARS = [
  { key: "familie", name: "Familiebil", priceInKr: 0, color: "#2b6cb0", speed: 380, turn: 3.2 },
  { key: "sport", name: "Sportsvogn", priceInKr: 400, color: "#d7262e", speed: 460, turn: 3.6 },
  { key: "racer", name: "Racerbil", priceInKr: 1500, color: "#f2c200", speed: 540, turn: 4 },
  { key: "super", name: "Superbil A", priceInKr: 4000, color: "#1a1a1a", speed: 620, turn: 4.4 }
];
var BUILDING_COLORS = ["#c05621", "#b7791f", "#718096", "#9b2c2c", "#2c5282", "#805ad5", "#a0aec0", "#dd6b20"];

var blocks = [];
var ramps = [];
var banks = [];
var station = null;
var helpers = [];
var prisoners = 0;
var progress = { bankInKr: 0, owned: ["familie"], selected: "familie" };

var phase = "menu";
var mode = "flugt";
var hero = null;
var chasers = [];
var robbers = [];
var camera = { x: 0, y: 0 };
var steering = null;
var lives = START_LIVES;
var lootInKr = 0;
var aliveTime = 0;
var hitCooldown = 0;
var nextChaserTime = 0;
var sirenTimer = 0;
var floaters = [];
var message = null;
var skids = [];
var MAX_SKIDS = 160;
var driftTime = 0;

function buildCity() {
  var bankSpots = { "1,1": true, "4,3": true, "2,5": true };
  var stationSpot = "4,1";
  for (var bx = 0; bx < BLOCKS; bx++) {
    for (var by = 0; by < BLOCKS; by++) {
      var x = ROAD + bx * STEP;
      var y = ROAD + by * STEP;
      var kind = bx + "," + by === stationSpot ? "station" : bankSpots[bx + "," + by] ? "bank" : (bx * 7 + by * 3) % 5 === 0 ? "park" : "houses";
      var block = { x: x, y: y, kind: kind, solids: [], trees: [] };
      if (kind === "houses") {
        var half = (BLOCK - 40) / 2;
        for (var i = 0; i < 4; i++) {
          block.solids.push({
            x: x + 10 + (i % 2) * (half + 20), y: y + 10 + Math.floor(i / 2) * (half + 20),
            w: half, h: half, color: BUILDING_COLORS[(bx + by * 2 + i) % BUILDING_COLORS.length]
          });
        }
      } else if (kind === "park") {
        for (var t = 0; t < 7; t++) block.trees.push({ x: x + 60 + ((t * 137) % 400), y: y + 60 + ((t * 211) % 400) });
      } else if (kind === "station") {
        var building = { x: x + 90, y: y + 90, w: BLOCK - 180, h: BLOCK - 230, color: "#dbe4ff" };
        block.solids.push(building);
        station = { building: building, zone: { x: x + 120, y: y + BLOCK - 130, w: BLOCK - 240, h: 120 } };
      } else {
        var bank = { x: x + 90, y: y + 90, w: BLOCK - 180, h: BLOCK - 230, color: "#e2e8f0" };
        block.solids.push(bank);
        banks.push({ building: bank, zone: { x: x + 120, y: y + BLOCK - 130, w: BLOCK - 240, h: 120 } });
      }
      blocks.push(block);
    }
  }
  for (var r = 0; r < 10; r++) {
    var horizontal = r % 2 === 0;
    var a = (r * 3 + 1) % BLOCKS;
    var b = (r * 5 + 2) % (BLOCKS + 1);
    if (horizontal) ramps.push({ x: ROAD + a * STEP + BLOCK / 2 - 60, y: b * STEP, w: 120, h: ROAD, horizontal: true });
    else ramps.push({ x: b * STEP, y: ROAD + a * STEP + BLOCK / 2 - 60, w: ROAD, h: 120, horizontal: false });
  }
}

function carSpec(key) {
  for (var i = 0; i < CARS.length; i++) if (CARS[i].key === key) return CARS[i];
  return CARS[0];
}

function setup() {
  buildCity();
  // Old shared progress (from before players) goes to the first named hero who opens the game.
  var legacy = !load("legacyClaimed", false) && player().id !== "gaest";
  if (legacy) save("legacyClaimed", true);
  progress = playerLoad("progress", legacy ? load("progress", progress) : progress);
  if (legacy) remember();
}

function remember() { playerSave("progress", progress); }

// Menu and game-over screens: a tall portrait layout when there is room, otherwise the
// landscape layout on a 1024 × 768 panel scaled to fit.
var PANEL_W = 1024;
var PANEL_H = 768;

function screenLayout() {
  var top = RESERVED.h + 20;
  if (HEIGHT > WIDTH && HEIGHT - top >= 1010) {
    top = Math.max(top, (HEIGHT - 1030) / 2);
    var W = WIDTH;
    return {
      transform: { x: 0, y: 0, scale: 1 }, width: W, height: HEIGHT,
      title: top + 40, bank: top + 100, carsTitle: top + 430, hint: top + 1010,
      flugt: { x: W / 2 - 340, y: top + 140, w: 680, h: 110 },
      politi: { x: W / 2 - 340, y: top + 270, w: 680, h: 110 },
      card: function (i) {
        var x = W / 2 - 310 + (i % 2) * 320, y = top + 460 + Math.floor(i / 2) * 270;
        return { x: x, y: y, w: 300, h: 250, carY: y + 80, nameY: y + 168, speedY: y + 198, priceY: y + 230 };
      }
    };
  }
  var scale = Math.min(WIDTH / PANEL_W, HEIGHT / PANEL_H);
  return {
    transform: { x: (WIDTH - PANEL_W * scale) / 2, y: (HEIGHT - PANEL_H * scale) / 2, scale: scale },
    width: PANEL_W, height: PANEL_H,
    title: 60, bank: 120, carsTitle: 320, hint: 700,
    flugt: { x: 150, y: 160, w: 340, h: 110 },
    politi: { x: 534, y: 160, w: 340, h: 110 },
    card: function (i) {
      var x = 92 + i * 220;
      return { x: x, y: 350, w: 200, h: 300, carY: 440, nameY: 540, speedY: 575, priceY: 620 };
    }
  };
}

function overLayout() {
  var scale = Math.min(WIDTH / PANEL_W, HEIGHT / PANEL_H);
  return { x: (WIDTH - PANEL_W * scale) / 2, y: (HEIGHT - PANEL_H * scale) / 2, scale: scale };
}

function roadPoint(index) {
  var corners = [[0, 0], [BLOCKS, BLOCKS], [0, BLOCKS], [BLOCKS, 0], [3, 0], [0, 3], [BLOCKS, 3], [3, BLOCKS]];
  var corner = corners[index % corners.length];
  return { x: corner[0] * STEP + ROAD / 2, y: corner[1] * STEP + ROAD / 2 };
}

function randomRoadSpot() {
  for (var tries = 0; tries < 30; tries++) {
    var node = { i: Math.floor(Math.random() * (BLOCKS + 1)), j: Math.floor(Math.random() * (BLOCKS + 1)) };
    var x = nodeX(node) + (Math.random() < 0.5 ? random(-200, 200) : 0);
    var y = x === nodeX(node) ? nodeY(node) + random(-200, 200) : nodeY(node);
    if (!hero || distance(x, y, hero.x, hero.y) > 700) return { x: Math.max(60, Math.min(WORLD - 60, x)), y: Math.max(60, Math.min(WORLD - 60, y)) };
  }
  return roadPoint(Math.floor(Math.random() * 8));
}

function makeCar(x, y, spec) {
  return { x: x, y: y, angle: -Math.PI / 2, speed: 0, vx: 0, vy: 0, spec: spec, air: 0, drifting: false };
}

function startGame(chosenMode) {
  mode = chosenMode;
  var spec = carSpec(progress.selected);
  hero = makeCar(3 * STEP + ROAD / 2, 3 * STEP + ROAD / 2, spec);
  if (mode === "politi") hero.police = true;
  chasers = [];
  robbers = [];
  helpers = [];
  prisoners = 0;
  lives = START_LIVES;
  lootInKr = 0;
  aliveTime = 0;
  hitCooldown = 2;
  floaters = [];
  skids = [];
  message = null;
  if (mode === "flugt") {
    for (var i = 0; i < 2; i++) addChaser();
    nextChaserTime = 40;
  } else {
    for (var j = 0; j < ROBBER_COUNT; j++) addRobber(j);
    for (var h = 0; h < HELPER_COUNT; h++) {
      var spot = randomRoadSpot();
      var helper = makeCar(spot.x, spot.y, { color: "#f5f5f5", speed: 400, turn: 3.2 });
      helper.police = true;
      helpers.push(helper);
    }
  }
  phase = "play";
  sfx("hop");
}

function addChaser() {
  var spot = roadPoint(chasers.length + 1);
  var chaser = makeCar(spot.x, spot.y, { color: "#f5f5f5", speed: 330 + chasers.length * 15, turn: 3 });
  chaser.police = true;
  chasers.push(chaser);
}

function addRobber(index) {
  var spot = randomRoadSpot();
  var robber = makeCar(spot.x, spot.y, { color: ["#d7262e", "#2f9e44", "#f76707", "#ae3ec9"][index % 4], speed: 420, turn: 3.4 });
  robber.wander = random(0, Math.PI * 2);
  robbers.push(robber);
}

// ---- Movement ----

function collide(car) {
  if (car.air > 0) return false;
  var hit = false;
  if (car.x < CAR_RADIUS) { car.x = CAR_RADIUS; hit = true; }
  if (car.y < CAR_RADIUS) { car.y = CAR_RADIUS; hit = true; }
  if (car.x > WORLD - CAR_RADIUS) { car.x = WORLD - CAR_RADIUS; hit = true; }
  if (car.y > WORLD - CAR_RADIUS) { car.y = WORLD - CAR_RADIUS; hit = true; }
  var bx = Math.floor((car.x - ROAD) / STEP);
  var by = Math.floor((car.y - ROAD) / STEP);
  for (var dx = -1; dx <= 1; dx++) {
    for (var dy = -1; dy <= 1; dy++) {
      var cx = bx + dx;
      var cy = by + dy;
      if (cx < 0 || cy < 0 || cx >= BLOCKS || cy >= BLOCKS) continue;
      blocks[cx * BLOCKS + cy].solids.forEach(function (rect) {
        var nearX = Math.max(rect.x, Math.min(car.x, rect.x + rect.w));
        var nearY = Math.max(rect.y, Math.min(car.y, rect.y + rect.h));
        var ox = car.x - nearX;
        var oy = car.y - nearY;
        var gap = Math.sqrt(ox * ox + oy * oy);
        if (gap >= CAR_RADIUS) return;
        hit = true;
        if (gap === 0) {
          var left = car.x - rect.x, right = rect.x + rect.w - car.x, top = car.y - rect.y, bottom = rect.y + rect.h - car.y;
          var least = Math.min(left, right, top, bottom);
          if (least === left) car.x = rect.x - CAR_RADIUS;
          else if (least === right) car.x = rect.x + rect.w + CAR_RADIUS;
          else if (least === top) car.y = rect.y - CAR_RADIUS;
          else car.y = rect.y + rect.h + CAR_RADIUS;
        } else {
          car.x = nearX + ox / gap * CAR_RADIUS;
          car.y = nearY + oy / gap * CAR_RADIUS;
        }
      });
    }
  }
  return hit;
}

function steerToward(car, angle, dt) {
  var diff = Math.atan2(Math.sin(angle - car.angle), Math.cos(angle - car.angle));
  var turn = car.spec.turn * dt;
  car.angle += Math.max(-turn, Math.min(turn, diff));
}

function drive(car, throttle, dt) {
  var target = throttle * car.spec.speed;
  car.speed += (target - car.speed) * Math.min(1, dt * (throttle > 0 ? 1.5 : 2.5));
  var wantX = Math.cos(car.angle) * car.speed;
  var wantY = Math.sin(car.angle) * car.speed;
  var moving = Math.atan2(car.vy, car.vx);
  var slip = Math.abs(Math.atan2(Math.sin(car.angle - moving), Math.cos(car.angle - moving)));
  car.drifting = car === hero && car.air === 0 && car.speed > 260 && slip > 0.3;
  var grip = car === hero ? (car.drifting ? 1.8 : 5) : 9;
  car.vx += (wantX - car.vx) * Math.min(1, grip * dt);
  car.vy += (wantY - car.vy) * Math.min(1, grip * dt);
  car.x += car.vx * dt;
  car.y += car.vy * dt;
  if (car.drifting) {
    driftTime += dt;
    for (var side = -1; side <= 1; side += 2) {
      skids.push({ x: car.x - Math.cos(car.angle) * 34 - Math.sin(car.angle) * 20 * side, y: car.y - Math.sin(car.angle) * 34 + Math.cos(car.angle) * 20 * side });
    }
    if (skids.length > MAX_SKIDS) skids.splice(0, skids.length - MAX_SKIDS);
    if (mode === "flugt") lootInKr += dt * 6;
  } else if (car === hero && driftTime > 0) {
    if (driftTime > 0.8) float("Drift! 🔥", car.x, car.y - 60, "#ffd34e");
    driftTime = 0;
  }
  if (car.air > 0) {
    car.air -= dt;
    if (car.air <= 0) { car.air = 0; sfx("bump"); }
  } else {
    ramps.forEach(function (ramp) {
      if (car.speed > RAMP_SPEED && car.x > ramp.x && car.x < ramp.x + ramp.w && car.y > ramp.y && car.y < ramp.y + ramp.h) {
        car.air = 0.5 + car.speed / 700;
        if (car === hero) { sfx("hop"); float("Hop! 🛫", car.x, car.y - 60, "#fff"); }
      }
    });
  }
  if (collide(car)) { car.speed *= 0.5; car.vx *= 0.5; car.vy *= 0.5; }
}

// Police and robbers follow the road grid: they drive from crossing to crossing.
function nodeOf(x, y) {
  return {
    i: Math.max(0, Math.min(BLOCKS, Math.round((x - ROAD / 2) / STEP))),
    j: Math.max(0, Math.min(BLOCKS, Math.round((y - ROAD / 2) / STEP)))
  };
}

function nodeX(node) { return node.i * STEP + ROAD / 2; }
function nodeY(node) { return node.j * STEP + ROAD / 2; }

function stepToward(from, goal) {
  var di = goal.i - from.i;
  var dj = goal.j - from.j;
  if (di === 0 && dj === 0) return from;
  if (Math.abs(di) >= Math.abs(dj)) return { i: from.i + (di > 0 ? 1 : -1), j: from.j };
  return { i: from.i, j: from.j + (dj > 0 ? 1 : -1) };
}

function randomNeighbour(from, avoidX, avoidY) {
  var options = [{ i: from.i + 1, j: from.j }, { i: from.i - 1, j: from.j }, { i: from.i, j: from.j + 1 }, { i: from.i, j: from.j - 1 }]
    .filter(function (n) { return n.i >= 0 && n.j >= 0 && n.i <= BLOCKS && n.j <= BLOCKS; });
  if (avoidX !== undefined) {
    options.sort(function (a, b) { return distance(nodeX(b), nodeY(b), avoidX, avoidY) - distance(nodeX(a), nodeY(a), avoidX, avoidY); });
    return options[0];
  }
  return options[Math.floor(Math.random() * options.length)];
}

function sameRoad(a, b) {
  var onColumn = Math.abs(a.x - b.x) < ROAD / 2 && Math.abs(((a.x - ROAD / 2) % STEP + STEP) % STEP) < ROAD / 2 + 5;
  var onRow = Math.abs(a.y - b.y) < ROAD / 2 && Math.abs(((a.y - ROAD / 2) % STEP + STEP) % STEP) < ROAD / 2 + 5;
  return onColumn || onRow;
}

function chase(car, target, dt) {
  if (distance(car.x, car.y, target.x, target.y) < 260 || (sameRoad(car, target) && distance(car.x, car.y, target.x, target.y) < STEP * 1.5)) {
    steerToward(car, Math.atan2(target.y - car.y, target.x - car.x), dt);
    car.waypoint = null;
    return;
  }
  if (!car.waypoint || distance(car.x, car.y, nodeX(car.waypoint), nodeY(car.waypoint)) < 50) {
    var here = car.waypoint || nodeOf(car.x, car.y);
    var next = stepToward(here, nodeOf(target.x, target.y));
    car.waypoint = next.i === here.i && next.j === here.j ? nodeOf(target.x, target.y) : next;
  }
  steerToward(car, Math.atan2(nodeY(car.waypoint) - car.y, nodeX(car.waypoint) - car.x), dt);
}

function roam(car, fleeFrom, dt) {
  if (!car.waypoint || distance(car.x, car.y, nodeX(car.waypoint), nodeY(car.waypoint)) < 50) {
    var here = car.waypoint || nodeOf(car.x, car.y);
    car.waypoint = fleeFrom ? randomNeighbour(here, fleeFrom.x, fleeFrom.y) : randomNeighbour(here);
  }
  steerToward(car, Math.atan2(nodeY(car.waypoint) - car.y, nodeX(car.waypoint) - car.x), dt);
}

function float(words, x, y, color) {
  floaters.push({ words: words, x: x, y: y, color: color, life: 1.4 });
}

function updatePlayer(dt) {
  if (steering) {
    var wx = steering.x + camera.x;
    var wy = steering.y + camera.y;
    if (distance(wx, wy, hero.x, hero.y) > 40) steerToward(hero, Math.atan2(wy - hero.y, wx - hero.x), dt);
    drive(hero, 1, dt);
  } else {
    drive(hero, 0, dt);
  }
}

function updateFlugt(dt) {
  aliveTime += dt;
  lootInKr += dt * (2 + aliveTime / 20);
  hitCooldown = Math.max(0, hitCooldown - dt);
  if (aliveTime > nextChaserTime && chasers.length < 6) { addChaser(); nextChaserTime += 40; float("Mere politi! 🚓", hero.x, hero.y - 80, "#fff"); }
  var closest = Infinity;
  chasers.forEach(function (chaser) {
    chase(chaser, hero, dt);
    drive(chaser, 1, dt);
    var gap = distance(chaser.x, chaser.y, hero.x, hero.y);
    closest = Math.min(closest, gap);
    if (gap < CAR_RADIUS * 2 && hitCooldown === 0 && hero.air === 0 && chaser.air === 0) {
      lives--;
      hitCooldown = HIT_COOLDOWN_IN_SECONDS;
      sfx("bump");
      float("Av! 💥", hero.x, hero.y - 60, "#ffd34e");
      chaser.speed = -150;
      if (lives <= 0) {
        phase = "over";
        message = { title: "🚓 Du blev fanget!", text: "Du mistede " + Math.floor(lootInKr) + " kr, som ikke var i banken", kept: false };
        sfx("tab");
      }
    }
  });
  sirenTimer -= dt;
  if (closest < 450 && sirenTimer <= 0) {
    sirenTimer = 1.4;
    beep(950, 0.25);
    setTimeout(function () { beep(700, 0.25); }, 300);
  }
  banks.forEach(function (bank) {
    var zone = bank.zone;
    if (lootInKr >= 1 && hero.x > zone.x && hero.x < zone.x + zone.w && hero.y > zone.y && hero.y < zone.y + zone.h) {
      var amount = Math.floor(lootInKr);
      progress.bankInKr += amount;
      lootInKr = 0;
      remember();
      sfx("mont");
      float("+" + amount + " kr i banken! 🏦", hero.x, hero.y - 70, "#ffd34e");
    }
  });
}

function inZone(car, zone) {
  return car.x > zone.x && car.x < zone.x + zone.w && car.y > zone.y && car.y < zone.y + zone.h;
}

function nearestRobber(car) {
  var best = null;
  robbers.forEach(function (robber) {
    var gap = distance(robber.x, robber.y, car.x, car.y);
    if (!best || gap < best.gap) best = { robber: robber, gap: gap };
  });
  return best && best.robber;
}

function replaceRobber(robber) {
  var index = robbers.indexOf(robber);
  robbers.splice(index, 1);
  addRobber(index + Math.floor(Math.random() * 4));
}

function updatePoliti(dt) {
  robbers.slice().forEach(function (robber) {
    var gap = distance(robber.x, robber.y, hero.x, hero.y);
    var fleeing = gap < 600 || helpers.some(function (h) { return distance(h.x, h.y, robber.x, robber.y) < 500; });
    roam(robber, gap < 600 ? hero : null, dt);
    robber.angle += Math.sin(Date.now() / 300 + robber.wander) * 0.6 * dt;
    drive(robber, fleeing ? 1 : 0.85, dt);
    if (gap < CAR_RADIUS * 2 && hero.air === 0) {
      if (prisoners >= MAX_PRISONERS) {
        if (!robber.warned) { float("Bilen er fuld! Kør til politistationen 🚓", hero.x, hero.y - 70, "#fff"); robber.warned = true; }
        return;
      }
      prisoners++;
      sfx("sejr");
      float("Fanget! 🚔 Kør ham til stationen", robber.x, robber.y - 60, "#ffd34e");
      replaceRobber(robber);
    }
  });
  helpers.forEach(function (helper) {
    var target = nearestRobber(helper);
    if (!target) return;
    chase(helper, target, dt);
    drive(helper, 1, dt);
    if (distance(helper.x, helper.y, target.x, target.y) < CAR_RADIUS * 2) {
      float("Din kollega fangede en røver! 👮", target.x, target.y - 60, "#fff");
      sfx("klik");
      replaceRobber(target);
    }
  });
  if (prisoners > 0 && inZone(hero, station.zone)) {
    var reward = prisoners * CATCH_REWARD_IN_KR;
    progress.bankInKr += reward;
    remember();
    float(prisoners + " røver" + (prisoners > 1 ? "e" : "") + " i fængsel! +" + reward + " kr", hero.x, hero.y - 70, "#ffd34e");
    prisoners = 0;
    sfx("mont");
  }
}

function update(dt) {
  for (var f = floaters.length - 1; f >= 0; f--) {
    floaters[f].life -= dt;
    floaters[f].y -= 40 * dt;
    if (floaters[f].life <= 0) floaters.splice(f, 1);
  }
  if (phase !== "play") return;
  updatePlayer(dt);
  if (mode === "flugt") updateFlugt(dt); else updatePoliti(dt);
  camera.x = Math.max(0, Math.min(WORLD - WIDTH, hero.x - WIDTH / 2));
  camera.y = Math.max(0, Math.min(WORLD - HEIGHT, hero.y - HEIGHT / 2));
}

// ---- Drawing ----

function roundedRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCar(car, scale) {
  var lift = 1 + car.air * 0.5;
  ctx.save();
  ctx.translate(car.x + car.air * 14, car.y + car.air * 14);
  ctx.rotate(car.angle);
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  roundedRect(-52, -27, 104, 54, 16);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.angle);
  ctx.scale(lift * scale, lift * scale);
  ctx.fillStyle = car.spec.color;
  roundedRect(-50, -25, 100, 50, 15);
  ctx.fill();
  ctx.fillStyle = "#22313f";
  roundedRect(8, -20, 20, 40, 6);
  ctx.fill();
  roundedRect(-36, -18, 14, 36, 5);
  ctx.fill();
  box(4, -29, 8, 5, car.spec.color);
  box(4, 24, 8, 5, car.spec.color);
  if (car.spec.key === "racer") { box(-50, -6, 100, 4, "#fff"); box(-50, 2, 100, 4, "#fff"); }
  if (car.spec.key === "super") { box(-56, -26, 8, 52, "#333"); box(30, -22, 12, 44, "rgba(255,255,255,0.08)"); }
  if (car.spec.key === "sport") box(-48, -3, 96, 6, "#1a1a1a");
  box(44, -20, 6, 10, "#fff2a8");
  box(44, 10, 6, 10, "#fff2a8");
  box(-50, -20, 4, 10, "#ff3b3b");
  box(-50, 10, 4, 10, "#ff3b3b");
  if (car.police) {
    box(-16, -26, 32, 6, "#1a1a1a");
    box(-16, 20, 32, 6, "#1a1a1a");
    var blink = Math.floor(Date.now() / 250) % 2 === 0;
    box(-12, -14, 10, 28, blink ? "#1c7ed6" : "#0b3d73");
    box(-2, -14, 10, 28, blink ? "#7a1010" : "#e03131");
    circle(-7, 0, 30, blink ? "rgba(28,126,214,0.25)" : "rgba(224,49,49,0.25)");
  }
  ctx.restore();
}

function visible(x, y, w, h) {
  return x + w > camera.x && x < camera.x + WIDTH && y + h > camera.y && y < camera.y + HEIGHT;
}

function drawCity() {
  clear("#6e6e73");
  ctx.save();
  ctx.translate(-Math.round(camera.x), -Math.round(camera.y));
  for (var i = 0; i <= BLOCKS; i++) {
    for (var d = 0; d < WORLD; d += 80) {
      if (visible(i * STEP + ROAD / 2 - 3, d, 6, 40)) box(i * STEP + ROAD / 2 - 3, d, 6, 40, "#fff");
      if (visible(d, i * STEP + ROAD / 2 - 3, 40, 6)) box(d, i * STEP + ROAD / 2 - 3, 40, 6, "#fff");
    }
  }
  blocks.forEach(function (block) {
    if (!visible(block.x - 20, block.y - 20, BLOCK + 40, BLOCK + 40)) return;
    box(block.x - 14, block.y - 14, BLOCK + 28, BLOCK + 28, "#bdbdc2");
    box(block.x, block.y, BLOCK, BLOCK, "#6bb35a");
    block.solids.forEach(function (rect) {
      box(rect.x + 8, rect.y + 8, rect.w, rect.h, "rgba(0,0,0,0.25)");
      box(rect.x, rect.y, rect.w, rect.h, rect.color);
      box(rect.x + 18, rect.y + 18, rect.w - 36, rect.h - 36, "rgba(255,255,255,0.12)");
    });
    block.trees.forEach(function (tree) {
      circle(tree.x + 6, tree.y + 6, 34, "rgba(0,0,0,0.2)");
      circle(tree.x, tree.y, 34, "#2f7d32");
      circle(tree.x - 6, tree.y - 6, 22, "#43a047");
    });
    if (block.kind === "station") {
      var house = station.building;
      text("🚓 POLITI", house.x + house.w / 2, house.y + house.h / 2, 44, "#1c3d8f");
      var gate = station.zone;
      box(gate.x, gate.y, gate.w, gate.h, prisoners > 0 ? "rgba(76,110,245,0.7)" : "rgba(76,110,245,0.35)");
      text("Aflever røvere her 🚔", gate.x + gate.w / 2, gate.y + gate.h / 2, 24, "#fff");
    }
    if (block.kind === "bank") {
      var bank = banks.filter(function (b) { return b.building.x === block.x + 90; })[0];
      text("🏦 BANK", bank.building.x + bank.building.w / 2, bank.building.y + bank.building.h / 2, 44, "#2c5282");
      var zone = bank.zone;
      box(zone.x, zone.y, zone.w, zone.h, lootInKr >= 1 ? "rgba(255,211,78,0.7)" : "rgba(255,211,78,0.35)");
      text("Kør ind her 💰", zone.x + zone.w / 2, zone.y + zone.h / 2, 26, "#5a3825");
    }
  });
  skids.forEach(function (mark) { box(mark.x - 4, mark.y - 4, 8, 8, "rgba(20,20,20,0.35)"); });
  ramps.forEach(function (ramp) {
    if (!visible(ramp.x, ramp.y, ramp.w, ramp.h)) return;
    box(ramp.x, ramp.y, ramp.w, ramp.h, "#ffcc00");
    for (var s = 0; s < 6; s++) {
      if (ramp.horizontal) box(ramp.x + s * 20, ramp.y, 10, ramp.h, "#1a1a1a");
      else box(ramp.x, ramp.y + s * 20, ramp.w, 10, "#1a1a1a");
    }
    text("HOP", ramp.x + ramp.w / 2, ramp.y + ramp.h / 2, 30, "#fff");
  });
  robbers.forEach(function (car) { drawCar(car, 1); });
  chasers.forEach(function (car) { drawCar(car, 1); });
  helpers.forEach(function (car) { drawCar(car, 1); });
  if (hero) {
    if (hitCooldown > 0 && Math.floor(Date.now() / 120) % 2 === 0 && mode === "flugt") ctx.globalAlpha = 0.5;
    if (hero.drifting) {
      circle(hero.x - Math.cos(hero.angle) * 50 + random(-6, 6), hero.y - Math.sin(hero.angle) * 50 + random(-6, 6), 22, "rgba(230,230,230,0.5)");
    }
    drawCar(hero, 1.05);
    ctx.globalAlpha = 1;
    if (mode === "flugt" && lootInKr >= 1) drawBankArrow();
    if (mode === "politi" && prisoners < MAX_PRISONERS) {
      var target = nearestRobber(hero);
      if (target && !visible(target.x - 50, target.y - 50, 100, 100)) drawArrowTo(target.x, target.y, "#e03131", 70);
    }
    if (mode === "politi" && prisoners > 0) drawArrowTo(station.zone.x + station.zone.w / 2, station.zone.y + station.zone.h / 2, "#4c6ef5");
  }
  floaters.forEach(function (f) { text(f.words, f.x, f.y, 30, f.color); });
  ctx.restore();
}

function drawBankArrow() {
  var nearest = null;
  banks.forEach(function (bank) {
    var cx = bank.zone.x + bank.zone.w / 2;
    var cy = bank.zone.y + bank.zone.h / 2;
    var gap = distance(cx, cy, hero.x, hero.y);
    if (!nearest || gap < nearest.gap) nearest = { x: cx, y: cy, gap: gap };
  });
  drawArrowTo(nearest.x, nearest.y, "#ffd34e");
}

function drawArrowTo(x, y, color, reach) {
  if (distance(x, y, hero.x, hero.y) < 200) return;
  var angle = Math.atan2(y - hero.y, x - hero.x);
  ctx.save();
  ctx.translate(hero.x + Math.cos(angle) * (reach || 90), hero.y + Math.sin(angle) * (reach || 90));
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(22, 0);
  ctx.lineTo(-12, -16);
  ctx.lineTo(-12, 16);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function bigButton(x, y, w, h, label, color, size) {
  box(x, y + 6, w, h, "rgba(0,0,0,0.3)");
  box(x, y, w, h, color);
  text(label, x + w / 2, y + h / 2, size || 30);
}

function drawHud() {
  box(WIDTH - 260, 12, 248, 52, "rgba(0,0,0,0.45)");
  text("🏦 " + progress.bankInKr + " kr", WIDTH - 136, 38, 28);
  if (mode === "flugt") {
    var hearts = "";
    for (var i = 0; i < START_LIVES; i++) hearts += i < lives ? "❤️" : "🖤";
    var left = Math.max(180, RESERVED.w + 10);
    var heartsTop = 12;
    if (left + 260 > WIDTH - 270) { left = 12; heartsTop = Math.max(130, RESERVED.h + 10); }
    box(left, heartsTop, 260, 52, "rgba(0,0,0,0.45)");
    text(hearts, left + 130, heartsTop + 26, 30);
    box(WIDTH - 260, 72, 248, 46, "rgba(0,0,0,0.35)");
    text("💰 Bytte: " + Math.floor(lootInKr) + " kr", WIDTH - 136, 95, 24);
  } else {
    var policeLeft = Math.max(180, RESERVED.w + 10);
    var policeTop = 12;
    if (policeLeft + 360 > WIDTH - 270) { policeLeft = 12; policeTop = Math.max(130, RESERVED.h + 10); }
    box(policeLeft, policeTop, 360, 52, "rgba(0,0,0,0.45)");
    text(prisoners > 0 ? "🚔 Røvere i bilen: " + prisoners + "/" + MAX_PRISONERS : "🚓 Fang røverne!", policeLeft + 180, policeTop + 26, 26);
  }
  bigButton(WIDTH - 172, HEIGHT - 92, 160, 76, "🏁 Stop", "#555a66", 26);
  if (!steering && hero.speed < 30) text("👆 Hold fingeren der hvor du vil køre hen", WIDTH / 2, HEIGHT > WIDTH ? HEIGHT - 150 : HEIGHT - 50, 26, "#fff");
}

function drawMenu() {
  var g = screenLayout();
  var t = g.transform;
  clear("#2a2d35");
  ctx.save();
  ctx.translate(t.x, t.y);
  ctx.scale(t.scale, t.scale);
  text("🚗 Flugtbilen 🚓", g.width / 2, g.title, 56, "#ffd34e");
  text(player().emoji + " 🏦 I banken: " + progress.bankInKr + " kr", g.width / 2, g.bank, 28);
  bigButton(g.flugt.x, g.flugt.y, g.flugt.w, g.flugt.h, "🚗 Flygt fra politiet", "#d7262e", 30);
  bigButton(g.politi.x, g.politi.y, g.politi.w, g.politi.h, "🚓 Vær politiet", "#1c7ed6", 30);
  text("🚙 Dine biler", g.width / 2, g.carsTitle, 32);
  CARS.forEach(function (spec, i) {
    var c = g.card(i);
    var owned = progress.owned.indexOf(spec.key) !== -1;
    var selected = progress.selected === spec.key;
    box(c.x, c.y, c.w, c.h, selected ? "#ffd34e" : "#3b3f4a");
    drawCar({ x: c.x + c.w / 2, y: c.carY, angle: -Math.PI / 2, spec: spec, air: 0 }, 1.2);
    text(spec.name, c.x + c.w / 2, c.nameY, 26, selected ? "#222" : "#fff");
    text("Fart: " + Math.round(spec.speed / 10), c.x + c.w / 2, c.speedY, 20, selected ? "#444" : "#cfd3dc");
    text(owned ? (selected ? "✔ Valgt" : "Vælg") : spec.priceInKr + " kr", c.x + c.w / 2, c.priceY, 24, selected ? "#222" : owned ? "#9ae6b4" : progress.bankInKr >= spec.priceInKr ? "#ffd34e" : "#888");
  });
  text("Kør til banken for at gemme pengene, før politiet fanger dig!", g.width / 2, g.hint, 22, "#cfd3dc");
  ctx.restore();
}

function drawOver() {
  var t = overLayout();
  box(0, 0, WIDTH, HEIGHT, "rgba(0,0,0,0.55)");
  ctx.save();
  ctx.translate(t.x, t.y);
  ctx.scale(t.scale, t.scale);
  box(212, 180, 600, 400, "#fff8e7");
  text(message.title, PANEL_W / 2, 250, 44, "#222");
  text(message.text, PANEL_W / 2, 320, 22, "#555");
  text("🏦 I banken: " + progress.bankInKr + " kr", PANEL_W / 2, 380, 30, "#2f9e44");
  bigButton(262, 450, 230, 90, "🔁 Igen", "#2f9e44");
  bigButton(532, 450, 230, 90, "🚙 Biler", "#1c7ed6");
  ctx.restore();
}

function draw() {
  if (phase === "menu") { drawMenu(); return; }
  drawCity();
  drawHud();
  if (phase === "over") drawOver();
}

// ---- Touch ----

function inside(x, y, left, top, w, h) {
  return x > left && x < left + w && y > top && y < top + h;
}

function onTap(x, y) {
  if (phase === "menu") {
    var g = screenLayout();
    var mx = (x - g.transform.x) / g.transform.scale;
    var my = (y - g.transform.y) / g.transform.scale;
    if (inside(mx, my, g.flugt.x, g.flugt.y, g.flugt.w, g.flugt.h)) { startGame("flugt"); return; }
    if (inside(mx, my, g.politi.x, g.politi.y, g.politi.w, g.politi.h)) { startGame("politi"); return; }
    CARS.forEach(function (spec, i) {
      var c = g.card(i);
      if (!inside(mx, my, c.x, c.y, c.w, c.h)) return;
      var owned = progress.owned.indexOf(spec.key) !== -1;
      if (!owned) {
        if (progress.bankInKr < spec.priceInKr) { sfx("bump"); return; }
        progress.bankInKr -= spec.priceInKr;
        progress.owned.push(spec.key);
        sfx("sejr");
      } else {
        sfx("klik");
      }
      progress.selected = spec.key;
      remember();
    });
    return;
  }
  if (phase === "over") {
    var t = overLayout();
    var ox = (x - t.x) / t.scale, oy = (y - t.y) / t.scale;
    if (inside(ox, oy, 262, 450, 230, 90)) startGame(mode);
    if (inside(ox, oy, 532, 450, 230, 90)) { phase = "menu"; sfx("klik"); }
    return;
  }
  if (inside(x, y, WIDTH - 172, HEIGHT - 92, 160, 76)) { phase = "menu"; steering = null; sfx("klik"); return; }
  steering = { x: x, y: y };
}

function onDrag(x, y) {
  if (steering) { steering.x = x; steering.y = y; }
}

function onRelease() {
  steering = null;
}
