// Hidden Realm Sketch - Combined from Code1, Code2, and Code3
// with full “press E to interact” dialogue functionality

let player;
let npcs = [];
let dialogueOpen = false;
let activeNPC = null;

let showStart = true;
let startButton;
let r6, sel; // r6.wav for hidden realm, sel.wav for interaction sound

// Starry sky & planets (from Code3)
let stars = [];
const NUM_STARS = 300;
let bgPlanets = [];
let presents = [];
let fireworks = [];    // Array to hold active Firework objects
let gravity;           // Gravity vector applied to all particles
let frameCounter = 0;  // To control spawn timing


class Particle {
  constructor(x, y, col, fireworkOrParticle) {
    this.pos = createVector(x, y);
    this.vel = fireworkOrParticle === 'rocket'
      ? createVector(random(-1, 1), random(-15, -16))    // initial rocket velocity
      : p5.Vector.random2D().mult(random(1, 6));         // explosion particle velocity

    this.acc = createVector(0, 0);
    this.lifespan = 255;   // explosion particles fade from 255 → 0
    this.col = col;        // color of this particle
    this.fireworkOrParticle = fireworkOrParticle;
    // rocket: “rocket” string, explosion bits: “fire”
  }

  applyForce(f) {
    this.acc.add(f);
  }

  update() {
    if (this.fireworkOrParticle === 'fire') {
      // Explosion particle: apply gravity, fade it
      this.vel.mult(0.9);
      this.lifespan -= 4;
      this.applyForce(gravity);
    }
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  done() {
    return (this.fireworkOrParticle === 'fire' && this.lifespan < 0);
  }

  show() {
    push()
    if (this.fireworkOrParticle === 'rocket') {
      // Draw rocket as a bright point or small ellipse
      strokeWeight(4);
      stroke(255, 255, 255);
      point(this.pos.x, this.pos.y);
    } else {
      // Draw explosion particle with fade
      colorMode(RGB);
      strokeWeight(3);
      stroke(
        this.col.levels[0], 
        this.col.levels[1], 
        this.col.levels[2], 
        this.lifespan
      );
      point(this.pos.x, this.pos.y);
    }
    pop()
  }
}

class Firework {
  constructor() {
    // Choose a random horizontal launch position
    this.pos = createVector(random(width * 0.2, width * 0.8), height);
    // Rocket starts with no velocity (it will be assigned in its Particle)
    this.rocket = new Particle(this.pos.x, this.pos.y, color(255), 'rocket');
    this.exploded = false;
    this.particles = [];  // will store explosion bits

    // Pick a random hue/color for the explosion
    this.fireworkColor = color(random(100, 255), random(100, 255), random(100, 255));
  }

  update() {
    if (!this.exploded) {
      // Move the rocket up until its velocity goes positive (it slows under gravity),
      // then trigger explosion
      this.rocket.applyForce(gravity);
      this.rocket.update();

      // Simple “peak detection”: if vertical velocity >= 0, explode
      if (this.rocket.vel.y >= 0) {
        this.exploded = true;
        this.explode();
      }
    }

    // Update all explosion particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.applyForce(gravity);
      p.update();
      if (p.done()) {
        // Remove faded particles
        this.particles.splice(i, 1);
      }
    }
  }

  explode() {
    // Create many particles at rocket’s position
    let numParticles = 80;
    for (let i = 0; i < numParticles; i++) {
      let part = new Particle(
        this.rocket.pos.x, 
        this.rocket.pos.y, 
        this.fireworkColor,
        'fire'
      );
      this.particles.push(part);
    }
  }

  done() {
    // Firework is done when all explosion bits have faded
    return this.exploded && this.particles.length === 0;
  }

  show() {
    if (!this.exploded) {
      this.rocket.show();
    }
    for (let p of this.particles) {
      p.show();
    }
  }
}

// ------------------------------
// NPC classes (adapted + dialogue handling)
// ------------------------------
class NPC {
  constructor(name, x, y, skinColor, eyeColor, dialogue = []) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.size = 30;
    this.skinColor = skinColor;
    this.eyeColor = eyeColor;
    this.dialogue = dialogue;     // array of strings
    this.dialogueIndex = 0;       // current dialogue line index
  }

  draw() {
    // Face the player
    let angle = atan2(player.y - this.y, player.x - this.x);

    push();
      translate(this.x, this.y);
      rotate(angle + PI/2);
      stroke(0);
      fill(this.skinColor);
      circle(0, 0, this.size);
      fill(this.eyeColor);
      circle(this.size * 0.2, -this.size * 0.2, this.size / 5);
      circle(-this.size * 0.2, -this.size * 0.2, this.size / 5);
    pop();

    // "Press E to interact" prompt when close
    if (!dialogueOpen && this.isNear()) {
      push();
        textFont('Comic Sans MS');
        textSize(14);
        fill(255);
        stroke(0);
        textAlign(CENTER);
        text("Press 'E' to interact", this.x, this.y - this.size - 10);
      pop();
    }
  }

  isNear() {
    return dist(player.x, player.y, this.x, this.y) < this.size + 5;
  }
}

class PigNPC extends NPC {
  constructor(name, x, y, dialogue = []) {
    super(name, x, y, '#FFC0CB', '#000000', dialogue);
    this.size = 30;
  }

  draw() {
    let angle = atan2(player.y - this.y, player.x - this.x);

    push();
      translate(this.x, this.y);
      rotate(angle - PI/2);
      stroke(0);
      fill('#FFC0CB');
      circle(0, 0, this.size);
      // ears
      fill('#FFC0CB');
      ellipse(-this.size * 0.3, -this.size * 0.4, this.size * 0.3, this.size * 0.2);
      ellipse(this.size * 0.3, -this.size * 0.4, this.size * 0.3, this.size * 0.2);
      // eyes
      fill(0);
      const eyeOff = this.size * 0.2;
      circle(-eyeOff, -eyeOff, 5);
      circle(eyeOff, -eyeOff, 5);
      // snout
      fill('#FF69B4');
      const sw = this.size * 0.4, sh = this.size * 0.25;
      ellipse(0, this.size * 0.1, sw, sh);
      fill(0);
      circle(-sw * 0.2, this.size * 0.1, 4);
      circle(sw * 0.2, this.size * 0.1, 4);
    pop();

    if (!dialogueOpen && this.isNear()) {
      push();
        textFont('Comic Sans MS');
        textSize(14);
        fill(255);
        stroke(0);
        textAlign(CENTER);
        text("Press 'E' to interact", this.x, this.y - this.size - 10);
      pop();
    }
  }
}

class HippoNPC extends NPC {
  constructor(name, x, y, dialogue = []) {
    super(name, x, y, '#9B59B6', '#000000', dialogue);
    this.size = 40;
  }

  draw() {
    let angle = atan2(player.y - this.y, player.x - this.x);

    push();
      translate(this.x, this.y);
      rotate(angle - PI/2);
      stroke(0);
      fill('#9B59B6');
      circle(0, 0, this.size);
      // ears
      fill('#9B59B6');
      circle(-this.size * 0.35, -this.size * 0.35, this.size * 0.2);
      circle(this.size * 0.35, -this.size * 0.35, this.size * 0.2);
      // eyes
      fill(0);
      const eyeOff = this.size * 0.2;
      circle(-eyeOff, -eyeOff, 6);
      circle(eyeOff, -eyeOff, 6);
      // snout
      fill('#9B59B6');
      const sw = this.size * 0.6, sh = this.size * 0.3;
      ellipse(0, this.size * 0.15, sw, sh);
      fill(0);
      const nostOff = this.size * 0.1;
      circle(-nostOff, this.size * 0.15, 4);
      circle(nostOff, this.size * 0.15, 4);
    pop();

    if (!dialogueOpen && this.isNear()) {
      push();
        textFont('Comic Sans MS');
        textSize(14);
        fill(255);
        stroke(0);
        textAlign(CENTER);
        text("Press 'E' to interact", this.x, this.y - this.size - 10);
      pop();
    }
  }
}

class FrogNPC extends NPC {
  constructor(name, x, y, dialogue = []) {
    super(name, x, y, '#00A000', '#FFFFFF', dialogue);
    this.size = 30;
  }

  draw() {
    let angle = atan2(player.y - this.y, player.x - this.x);

    push();
      translate(this.x, this.y);
      rotate(angle - PI/2);
      stroke(0);
      fill('#00A000');
      circle(0, 0, this.size);
      // eyes
      const eo = this.size * 0.2;
      fill('#FFFFFF');
      circle(-eo, -eo, this.size * 0.2);
      circle(eo, -eo, this.size * 0.2);
      fill(0);
      circle(-eo, -eo, this.size * 0.1);
      circle(eo, -eo, this.size * 0.1);
      // frown
      noFill();
      stroke(0);
      strokeWeight(2);
      const mw = this.size * 0.5;
      arc(0, this.size * 0.15, mw, mw * 0.5, PI, TWO_PI);
    pop();

    if (!dialogueOpen && this.isNear()) {
      push();
        textFont('Comic Sans MS');
        textSize(14);
        fill(255);
        stroke(0);
        textAlign(CENTER);
        text("Press 'E' to interact", this.x, this.y - this.size - 10);
      pop();
    }
  }
}

class GuardNPC extends NPC {
  constructor(name, x, y, dialogue = []) {
    super(name, x, y, '#D8BFD8', '#000000', dialogue);
    this.size = 40;
  }

  draw() {
    let angle = atan2(player.y - this.y, player.x - this.x);

    push();
      translate(this.x, this.y);
      rotate(angle + PI/2);
      stroke(0);
      fill(this.skinColor);
      circle(0, 0, this.size);
      fill(this.eyeColor);
      circle(this.size * 0.2, -this.size * 0.2, this.size / 5);
      circle(-this.size * 0.2, -this.size * 0.2, this.size / 5);
      circle(0, this.size * 0.001, this.size / 6);
    pop();

    if (!dialogueOpen && this.isNear()) {
      push();
        textFont('Comic Sans MS');
        textSize(14);
        fill(255);
        stroke(0);
        textAlign(CENTER);
        text("Press 'E' to interact", this.x, this.y - this.size - 10);
      pop();
    }
  }
}

class KingNPC extends NPC {
  constructor(name, x, y, dialogue = []) {
    super(name, x, y, '#CCFFCC', '#000000', dialogue);
    this.size = 60;
  }

  draw() {
    let angle = atan2(player.y - this.y, player.x - this.x);

    push();
      translate(this.x, this.y);
      rotate(angle - PI/2);
      stroke(0);
      fill(this.skinColor);
      circle(0, 0, this.size);
      // eyes
      noStroke();
      fill(this.eyeColor);
      let eyeR = this.size * 0.06;
      let ex = this.size * 0.2, ey = -this.size * 0.18;
      circle(-ex, ey, eyeR);
      circle(ex, ey, eyeR);
      // beak
      fill('#FFCC66');
      let bw = this.size * 0.25, bh = this.size * 0.12;
      ellipse(0, this.size * 0.02, bw, bh);
      stroke('#E6B800');
      strokeWeight(2);
      line(-bw / 2 + 4, this.size * 0.02, bw / 2 - 4, this.size * 0.02);
      // belly
      noStroke();
      fill('#FFFFFF');
      ellipse(0, this.size * 0.25, this.size * 0.4, this.size * 0.3);
      // crown
      noStroke();
      fill('#FFD700');
      beginShape();
        vertex(-this.size * 0.35, -this.size * 0.45);
        vertex(-this.size * 0.15, -this.size * 0.75);
        vertex(0, -this.size * 0.45);
        vertex(this.size * 0.15, -this.size * 0.75);
        vertex(this.size * 0.35, -this.size * 0.45);
        vertex(this.size * 0.35, -this.size * 0.35);
        vertex(-this.size * 0.35, -this.size * 0.35);
      endShape(CLOSE);
      const gemColors = ['#FF0000', '#00FF00', '#0000FF'];
      const gemXs = [-this.size * 0.15, 0, this.size * 0.15];
      let gemY = -this.size * 0.75;
      for (let i = 0; i < 3; i++) {
        fill(gemColors[i]);
        circle(gemXs[i], gemY, this.size * 0.08);
      }
    pop();

    if (!dialogueOpen && this.isNear()) {
      push();
        textFont('Comic Sans MS');
        textSize(14);
        fill(255);
        stroke(0);
        textAlign(CENTER);
        text("Press 'E' to interact", this.x, this.y - this.size - 10);
      pop();
    }
  }
}

// Player class (from Code2)
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 30;
    this.speed = 2;
  }

  update() {
    let nx = this.x;
    let ny = this.y;
    if (keyIsDown(87)) ny -= this.speed; // W
    if (keyIsDown(83)) ny += this.speed; // S
    if (keyIsDown(65)) nx -= this.speed; // A
    if (keyIsDown(68)) nx += this.speed; // D

    // Barrier so player cannot walk into the sky (top quarter)
    if (ny - this.size / 2 < height / 4) {
      ny = this.y;
    }

    this.x = nx;
    this.y = ny;
  }

  draw() {
    let angle = atan2(mouseY - this.y, mouseX - this.x);
    push();
      translate(this.x, this.y);
      rotate(angle + PI / 2);
      stroke(0);
      fill('#E1C594');
      circle(0, 0, this.size);
      // eyes
      fill(255);
      let eo = this.size * 0.2;
      circle(-eo, -eo, this.size * 0.2);
      circle(eo, -eo, this.size * 0.2);
    pop();
  }
}



// ------------------------------
// Draw rolling hills (from Code2)
// ------------------------------
function drawHills() {
  fill(100, 200, 100);
  stroke(0, 100, 0);
  ellipse(width * 0.3, height * 0.71+100, 1000, 600);
  ellipse(width * 0.7, height * 0.70+100, 1200, 600);
}

// ------------------------------
// Initialize starry sky & planets (from Code3)
// ------------------------------
function initStarfield() {
  for (let i = 0; i < NUM_STARS; i++) {
    stars.push({
      x: random(width),
      y: random(0, height / 3 + 50),
      si: random(1, 3),
      color: random(['#FFFFFF', '#FFFF99', '#FF99FF'])
    });
  }
  for (let i = 0; i < 8; i++) {
    let sz = random(10, 30);
    let posY = random(0, height / 3);
    let posX = random(-sz, width + sz);
    let col = color(random(50, 200), random(50, 200), random(50, 200), 200);
    let speed = random(0.1, 0.5);
    bgPlanets.push(new BackgroundPlanet(posX, posY, sz, col, speed));
  }
}

// ------------------------------
// BackgroundPlanet class (from Code3)
// ------------------------------
class BackgroundPlanet {
  constructor(x, y, size, col, speed) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.col = col;
    this.speed = speed;
  }

  update() {
    this.x = (this.x + this.speed) % (width + this.size);
  }

  draw() {
    push();
      translate(this.x, this.y);
      noStroke();
      fill(this.col);
      circle(0, 0, this.size);
      noFill();
      stroke(255, 255, 255, 100);
      strokeWeight(this.size * 0.05);
      ellipse(0, 0, this.size * 1.2, this.size * 0.6);
    pop();
  }
}

// ------------------------------
// Draw starry sky (from Code3)
// ------------------------------
function drawStarrySky() {
  // Top third black background
  noStroke();
  fill(0);
  rect(0, 0, width, height / 3);
  for (let s of stars) {
    s.x = (s.x + 0.2) % width;
    fill(s.color);
    circle(s.x, s.y, s.si);
  }
  for (let p of bgPlanets) {
    p.update();
    p.draw();
  }
}

// ------------------------------
// Dialogue GUI for active NPC
// ------------------------------
function drawDialogueGUI() {
  if (!activeNPC) return;

  const guiW = width * 0.8;
  const guiH = height * 0.4;
  const guiX = (width - guiW) / 2;
  const guiY = (height - guiH) / 2;
  const arrowSize = 20;

  // Darken background
  push();
    fill(0, 150);
    rect(0, 0, width, height);
  pop();

  // Dialogue panel
  push();
    fill(230);
    stroke(0);
    rect(guiX, guiY, guiW, guiH, 8);
  pop();

  // Portrait box
  const portraitW = guiW * 0.3;
  const portraitH = guiH * 0.8;
  const portraitX = guiX + 10;
  const portraitY = guiY + 10;

  push();
    fill(255);
    stroke(0);
    rect(portraitX, portraitY, portraitW, portraitH, 4);
  pop();

  // Draw a simple colored circle for portrait
  push();
    const px = portraitX + portraitW / 2;
    const py = portraitY + portraitH / 2;
    translate(px, py);
    stroke(0);
    fill(activeNPC.skinColor);
    circle(0, 0, portraitH * 0.5);
    fill(activeNPC.eyeColor);
    let off = (portraitH * 0.5) * 0.2;
    circle(-off, -off, portraitH * 0.1);
    circle(off, -off, portraitH * 0.1);
  pop();

  // Name bar below portrait
  const nameH = 30;
  const nameY = portraitY + portraitH;

  push();
    fill(240);
    stroke(0);
    rect(portraitX, nameY, portraitW, nameH, 4);
  pop();

  noStroke();
  fill(0);
  textFont('Comic Sans MS');
  textSize(16);
  textAlign(CENTER, CENTER);
  text(activeNPC.name, portraitX + portraitW / 2, nameY + nameH / 2);

  // Dialogue text area
  noStroke();
  fill(0);
  textFont('Comic Sans MS');
  textSize(16);
  textAlign(LEFT, TOP);
  const textX = portraitX + portraitW + 20;
  const textY = portraitY + 20;
  const textW = guiW - portraitW - 40;
  const textH = portraitH;

  // If NPC has dialogue lines, show current; otherwise a default
  let lines = activeNPC.dialogue.length ? activeNPC.dialogue : ["..."];
  let idx = activeNPC.dialogueIndex;
  text(lines[idx], textX, textY, textW, textH);

  // Arrows to navigate dialogue
  push();
    fill(0);
    // Previous arrow
    if (idx > 0) {
      triangle(
        width / 2 - 20, guiY + guiH - arrowSize * 2 + arrowSize / 2,
        width / 2 - 20 + arrowSize, guiY + guiH - arrowSize * 2,
        width / 2 - 20 + arrowSize, guiY + guiH - arrowSize * 2 + arrowSize
      );
    }
    // Next arrow
    if (idx < lines.length - 1) {
      triangle(
        width / 2 + 20, guiY + guiH - arrowSize * 2,
        width / 2 + 20, guiY + guiH - arrowSize * 2 + arrowSize,
        width / 2 + 20 + arrowSize, guiY + guiH - arrowSize * 2 + arrowSize / 2
      );
    }
  pop();

  // Close X in top-right corner
  push();
    stroke(0);
    strokeWeight(2);
    let xSize = 20;
    let xX = guiX + guiW - xSize - 10;
    let xY = guiY + 10;
    line(xX, xY, xX + xSize, xY + xSize);
    line(xX + xSize, xY, xX, xY + xSize);
  pop();
}

// ------------------------------
// Draw Boston skyline (from Code2)
// ------------------------------
function drawBostonSkyline(x, y) {
  push();
    translate(x, y);
    const bWidths = [15, 20, 15, 20, 30];
    const bHeights = [50, 90, 100, 80, 70];
    let xOffset = 0;
    for (let i = 0; i < bWidths.length; i++) {
      const bw = bWidths[i];
      const bh = bHeights[i];
      fill(50, 50, 70);
      rect(xOffset, -bh, bw, bh);
      if (i === 0) {
        fill(200, 30, 30);
        const triTopY = -bh - 12;
        triangle(
          xOffset + bw / 2, triTopY,
          xOffset + 2, -bh + 2,
          xOffset + bw - 2, -bh + 2
        );
        fill(255);
        textSize(3);
        textAlign(CENTER, CENTER);
        text('CITGO', xOffset + bw / 2, -bh);
      }
      if (i === 2) {
        fill(50, 50, 70);
        arc(
          xOffset + bw / 2,
          -bh,
          bw, bw,
          PI, TWO_PI
        );
      }
      fill(255, 240, 100);
      const cols = floor(bw / 6);
      const rows = floor(bh / 10);
      const winW = 4, winH = 8;
      const xGap = bw / (cols + 1);
      const yGap = bh / (rows + 1);
      for (let c = 1; c <= cols; c++) {
        for (let r = 1; r <= rows; r++) {
          const wx = xOffset + c * xGap - winW / 2;
          const wy = -r * yGap - winH / 2;
          rect(wx, wy, winW, winH);
        }
      }
      xOffset += bw;
    }
  pop();
}

// ------------------------------
// Draw rolling hills (from Code2)
// ------------------------------
function drawHills() {
  fill(100, 200, 100);
  stroke(0, 100, 0);
  ellipse(width * 0.3, height * 0.71, 1000, 600);
  ellipse(width * 0.7, height * 0.70, 1200, 600);
}

// ------------------------------
// Initialize starry sky & planets (from Code3)
// ------------------------------
function initStarfield() {
  for (let i = 0; i < NUM_STARS; i++) {
    stars.push({
      x: random(width),
      y: random(0, height / 3 + 50),
      si: random(1, 3),
      color: random(['#FFFFFF', '#FFFF99', '#FF99FF'])
    });
  }
  for (let i = 0; i < 8; i++) {
    let sz = random(10, 30);
    let posY = random(0, height / 3);
    let posX = random(-sz, width + sz);
    let col = color(random(50, 200), random(50, 200), random(50, 200), 200);
    let speed = random(0.1, 0.5);
    bgPlanets.push(new BackgroundPlanet(posX, posY, sz, col, speed));
  }
}



// ------------------------------
// Draw starry sky (from Code3)
// ------------------------------
function drawStarrySky() {
  // Top third black background
  noStroke();
  fill(0);
  rect(0, 0, width, height / 3);
  for (let s of stars) {
    s.x = (s.x + 0.2) % width;
    fill(s.color);
    circle(s.x, s.y, s.si);
  }
  for (let p of bgPlanets) {
    p.update();
    p.draw();
  }
}

// ------------------------------
// Setup and main logic
// ------------------------------
function preload() {
  soundFormats('wav');
  r6 = loadSound('r5.wav');
  sel = loadSound('sel.wav');
}

function setup() {
  const cnv = createCanvas(600, 600).parent('sketch-container');
  canvasX = cnv.elt.offsetLeft;
  canvasY = cnv.elt.offsetTop;
  gravity = createVector(0, 0.2);

  // Initialize starfield and planets
  initStarfield();

  for (let i = 0; i < 40; i++) {
    // 1) Random box size
    let boxW = random(20, 50);
    let boxH = random(15, 40);

    // 2) Random position along bottom third (fixed from now on)
    let x = random(boxW / 2, width - boxW / 2);
    // We place y somewhere between 70% and 90% of the canvas height
    let y = random(height * 0.7 + boxH / 2, height * 0.9);

    // 3) Random wrapping‐paper color
    let wrapR = random(0, 255);
    let wrapG = random(0, 255);
    let wrapB = random(0, 255);

    // 4) Random ribbon color
    let ribbonR = random(0, 255);
    let ribbonG = random(0, 255);
    let ribbonB = random(0, 255);

    // Store all properties in an object
    presents.push({
      x, y,
      boxW, boxH,
      wrapColor: [wrapR, wrapG, wrapB],
      ribbonColor: [ribbonR, ribbonG, ribbonB]
    });
  }

  // Create player at center-bottom
  player = new Player(width / 2, height * 0.75);

  // Provide dialogue lines for each NPC
  // Feel free to customize these arrays with whatever text you want.
  let pigDialogue = [
    "Happy birthday Eleni!",
    "I guess you were probably wondering why on earth I would hire fatty to work in my lab",
    "Between us, I wouldn't normally do that, but if I didn't include her in our birthday suprise, she would've consumed too many burgers."
  ];
  let frogDialogue = [
    "Happy birthday Eleni!",
    "I guess this is a kind of vacation...",
    "I know I always frown, but really I'm happy inside seeing you being celebrated by your loved ones."
  ];
  let hippoDialogue = [
    "*Yawns* oh hey!!",
    "Happy birthday! Maybe you'd be willing to share any edible gifts with me?",
    "Also do you have left overs from dinner?"
  ];
  let kingDialogue = [
    "You found the secret realm!",
    "This is where we go when you're away to hangout...",
    "I can't really tell you where we are. We are certainly billions of light years away from earth. How we get here will remain a mystery to you for now...",
    "Oh, and one more thing...",
    "It was me who sent the email to you last night.",
    "I had to make sure you were truly ready to embark on the adventure to get here."
  ];
  let guardDialogue = [
    "Whaddup! It's Lireni the Guard from Elenia!",
    "All that formal talk was just for show lol.",
    "But you are still certainly the chosen one...",
    "Happy birthday!"
  ];

  // Create NPCs on the hills
  pigNPC   = new PigNPC  ('Chubs', 200, 170, pigDialogue);
  frogNPC  = new FrogNPC ('Ricky', 320, 150, frogDialogue);
  hippoNPC = new HippoNPC('Fatty', 420, 180, hippoDialogue);
  kingNPC  = new KingNPC ('Penguin', 280, 220, kingDialogue);
  guardNPC = new GuardNPC('Lireni', 350, 220, guardDialogue);

  let coreyDialogue = [
    "Eleni...",
    "I love you to... wherever we are to the earth and back.",
    "Sometimes, my admiration for you can't be described.",
    "So I needed to build and gift you a universe instead.",
    "Happy birthday :)"

  ];
  let coreyNPC = new NPC(
  'Corey',
  400,       // x-coordinate on the hill
  230,       // y-coordinate on the hill
  '#E1C594', // skinColor (same as player)
  '#FFFFFF', // eyeColor (white)
  coreyDialogue
);

  const johnDialogue = ["Happy birthday Eleni! <3"];
  const algeaDialogue = [
    "Happy birthday Eleni! <3"
  ];
  const howellDialogue = ["Happy birthday Eleyni!", "Don't forget how to take the integral over a sphere..."];

  howellNPC = new NPC('Dad', 240, 170, '#E1C594', '#AAAAAA', howellDialogue)
  johnNPC = new NPC('Dad', 220, 200, '#E1C594', '#FFFFFF', johnDialogue)
  agleaNPC = new NPC('Mom', 200, 240, '#F0D5B1', '#FFCCCC', algeaDialogue)

  npcs.push(coreyNPC, johnNPC, agleaNPC, howellNPC);

  npcs.push(pigNPC, frogNPC, hippoNPC, kingNPC, guardNPC);

  // Start button setup
  startButton = createButton('Start');
  startButton.style('font-family', 'Comic Sans MS');
  startButton.style('font-size', '16px');
  startButton.position((windowWidth - width) / 2 + width / 2 - 30,
                       (windowHeight - height) / 2 + height / 2 + 20);
  startButton.mousePressed(() => {
    showStart = false;
    if (r6 && !r6.isPlaying()) {
      r6.loop();
    }
    startButton.hide();
  });
}

function draw() {
  if (showStart) {
    // Initial "Level ?: Hidden Realm" screen
    background(30, 30, 60);
    textFont('Comic Sans MS');
    textAlign(CENTER, CENTER);
    fill(255);
    textSize(28);
    text("Level ?: Hidden Realm", width / 2, height / 2 - 20);
    return;
  }

  // --- Draw combined background ---

  // 1) Starry sky & planets (top third)
  drawStarrySky();

if (frameCounter % 30 === 0) {
    let f = new Firework();
    fireworks.push(f);
  }
  frameCounter++;

  // 2) Update and draw all fireworks
  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].show();
    if (fireworks[i].done()) {
      fireworks.splice(i, 1);
    }
  }
  drawHills();
  // 2) Lower two-thirds: Boston skyline + hills


  drawPresents();
  drawRainbowText();

  // --- Draw NPCs & player ---
  for (let npc of npcs) {
    npc.draw();
  }
  player.update();
  player.draw();

  // If a dialogue is open, draw the dialogue GUI
  if (dialogueOpen && activeNPC) {
    drawDialogueGUI();
  }

}

function drawPresents() {
  push()
  for (let p of presents) {
    let { x, y, boxW, boxH, wrapColor, ribbonColor } = p;

    // Unpack colors
    let [wrapR, wrapG, wrapB] = wrapColor;
    let [ribbonR, ribbonG, ribbonB] = ribbonColor;
    stroke(0);
    // Draw the wrapped box
    fill(wrapR, wrapG, wrapB);
    rectMode(CENTER);
    rect(x, y, boxW, boxH, 4); // 4px corner radius

    // Draw vertical ribbon stripe
    fill(ribbonR, ribbonG, ribbonB);
    let stripeW = boxW * 0.2;
    rect(x, y, stripeW, boxH + 2);

    // Draw horizontal ribbon stripe
    let stripeH = boxH * 0.2;
    rect(x, y, boxW + 2, stripeH);

    // Draw a bow on top of the box:
    let bowCenterX = x;
    // Position the bow just above the top edge of the box (a little 
    // offset by half of the ribbon’s thickness):
    let bowCenterY = y - boxH / 2 - stripeH * 0.4;

    // Draw two “loops” of the bow (ellipses)
    let loopW = boxW * 0.3;
    let loopH = boxH * 0.3;
    fill(ribbonR, ribbonG, ribbonB);
    // Left loop
    ellipse(bowCenterX - loopW * 0.4, bowCenterY, loopW, loopH);
    // Right loop
    ellipse(bowCenterX + loopW * 0.4, bowCenterY, loopW, loopH);
    // Knot in the center
    ellipse(bowCenterX, bowCenterY, loopW * 0.6, loopH * 0.6);
  }
  pop()
}

function keyPressed() {
  if ((key === 'E' || key === 'e') && !dialogueOpen) {
    for (let npc of npcs) {
      if (npc.isNear()) {
        sel.play();
        activeNPC = npc;
        dialogueOpen = true;
        npc.dialogueIndex = 0;
        return;
      }
    }
  }
}

function mousePressed() {
  if (!dialogueOpen || !activeNPC) return;

  // Compute GUI bounds (same as before)
  const guiW = width * 0.8;
  const guiH = height * 0.4;
  const guiX = (width - guiW) / 2;
  const guiY = (height - guiH) / 2;
  const arrowSize = 20;

  // Close‐“X” coordinates
  let xSize = 20;
  let xX = guiX + guiW - xSize - 10;
  let xY = guiY + 10;

  // If click is inside the “X” box, close dialogue
  if (
    mouseX > xX && mouseX < xX + xSize &&
    mouseY > xY && mouseY < xY + xSize
  ) {
    // ** NEW: if the NPC was “Corey”, open/download the ZIP **
    if (activeNPC.name === "Corey") {
      // (a) To open in a new tab:
      window.open('https://drive.google.com/uc?export=download&id=1h7mZnhsqSEJYB8P3eou-7LScr854svHo');

    }

    dialogueOpen = false;
    activeNPC = null;
    return;
  }

  // === (The rest of your arrow‐click logic remains unchanged) ===

  // Next arrow (right)
  let nextX = width / 2 + 20;
  let nextY = guiY + guiH - arrowSize * 2;
  let lines = activeNPC.dialogue.length ? activeNPC.dialogue : ["..."];
  let idx = activeNPC.dialogueIndex;
  if (
    idx < lines.length - 1 &&
    mouseX > nextX && mouseX < nextX + arrowSize &&
    mouseY > nextY && mouseY < nextY + arrowSize
  ) {
    activeNPC.dialogueIndex++;
    return;
  }

  // Prev arrow (left)
  let prevX = width / 2 - 20 - arrowSize;
  let prevY = nextY;
  if (
    idx > 0 &&
    mouseX > prevX && mouseX < prevX + arrowSize &&
    mouseY > prevY && mouseY < prevY + arrowSize
  ) {
    activeNPC.dialogueIndex--;
    return;
  }
}


function drawRainbowText() {
  push()
  // 1) The string we want to display
  let msg = "Happy Birthday Eleni";
  
  // 2) A hard‐coded rainbow palette (seven colors).
  //    Make sure the green (#00FF00) is noticeably brighter/different
  //    than any background‐hill green, etc.
  let rainbow = [
    '#FF0000',  // Red
    '#FF7F00',  // Orange
    '#FFFF00',  // Yellow
    '#00FF00',  // Bright Lime Green
    '#0000FF',  // Blue
    '#4B0082',  // Indigo
    '#8F00FF'   // Violet
  ];
  
  // 3) Choose a large font size and a readable font
  textFont('Comic Sans MS');
  textSize(24);               // Adjust up/down to taste
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  
  // 4) Break the message into an array of characters
  let chars = msg.split("");
  let totalChars = chars.length;
  
  // 5) Compute the total width of the entire string in the current font/size
  //    so we can position each letter properly.  p5.js’s textWidth() gives
  //    the width of a string in pixels.
  let totalWidth = 0;
  for (let c of chars) {
    totalWidth += textWidth(c);
  }
  
  // 6) Starting X‐coordinate so that the whole msg is centered
  let startX = width / 2 - totalWidth / 2;
  let cursorX = startX;
  let centerY = height / 2;   // vertical center of canvas
  
  // 7) Draw each character one by one, cycling through the rainbow array
  for (let i = 0; i < totalChars; i++) {
    let ch = chars[i];
    let col = rainbow[i % rainbow.length];  // cycle through 7 colors
    
    fill(col);
    noStroke();
    // Draw the character at (cursorX + half its width, centerY)
    //    because text() is by default bottom‐left aligned.  We use textAlign(CENTER, CENTER),
    //    so (cursorX + textWidth(ch)/2, centerY) centers that letter horizontally & vertically.
    let w = textWidth(ch);
    text(ch, cursorX + w / 2, centerY);
    
    // Advance the cursor by that character’s width
    cursorX += w;
  }
  pop()
}

