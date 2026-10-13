useFont("kridt");
window.HI_RES = true;

// Copy this folder to start a new game.

var theme = { background: "#2b6cb0", accent: "#4fd1c5", text: "#fff" };

var player = { x: WIDTH / 2, y: HEIGHT / 2 };

function setup() {
}

function update(dt) {
}

function draw() {
  clear(theme.background);
  emoji("🐱", player.x, player.y, 100);
}

function onTap(x, y) {
  player.x = x;
  player.y = y;
  sfx("hop");
}
