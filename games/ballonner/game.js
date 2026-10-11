useFont("tusch");

var balloons = [];
var points = 0;
var best = 0;

function setup() {
  best = load("best", 0);
}

function update(dt) {
  if (Math.random() < dt * 1.5) {
    balloons.push({ x: random(80, WIDTH - 80), y: HEIGHT + 80, speed: random(80, 200) + points * 4 });
  }
  for (var i = balloons.length - 1; i >= 0; i--) {
    balloons[i].y -= balloons[i].speed * dt;
    if (balloons[i].y < -100) balloons.splice(i, 1);
  }
}

function draw() {
  clear("#87ceeb");
  balloons.forEach(function (b) { emoji("🎈", b.x, b.y, 110); });
  text("Point: " + points, WIDTH / 2, 50, 44);
  text("Rekord: " + best, WIDTH - 140, 50, 28);
}

function onTap(x, y) {
  for (var i = balloons.length - 1; i >= 0; i--) {
    if (distance(x, y, balloons[i].x, balloons[i].y) < 70) {
      balloons.splice(i, 1);
      points++;
      sfx("pop");
      if (points > best) { best = points; save("best", best); }
      return;
    }
  }
}
