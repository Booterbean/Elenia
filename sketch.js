let showOverlay = true;
let startButton;
let audio;
let nextHopTime = 0;

const roadW = 80;
const sideW = 20;
let player;

// Store house data with random window counts
let houses = [];

const interactTree = {
  x: 570,
  y: 490,
  radius: 20    // how close the player must be
};
// NPCs and dialogue state
let npcs = [];
let dialogueOpen = false;
let activeNPC = null;

class player1 {
  constructor() {
    this.x = -200;
    this.y = 280;
    this.vel = 2;
    this.size = 30;
    this.flenl = 5;
    this.flenr = 5;
  }
  draw() {
    this.mainp(this.x, this.y);
    if (keyIsDown(87)) this.y -= this.vel;
    if (keyIsDown(83)) this.y += this.vel;
    if (keyIsDown(65)) this.x -= this.vel;
    if (keyIsDown(68)) this.x += this.vel;
  }
  isClicked(mx, my) {
    // compute the player’s actual screen coords
    let sx = width/2 + this.x;
    let sy = height/2 + this.y;
    // distance from click to center
    return dist(mx, my, sx, sy) < this.size/2;
  }
  mainp(x, y) {
    push();
      // face mouse
      let angle = Math.atan2((mouseY - y) - height/2,
                             (mouseX - x) - width/2);
      translate(width/2, height/2);
      translate(x, y);
      rotate(angle);
      translate(-x, -y);

      stroke(0);
      strokeWeight(1);
      fill('#E1C594');
      circle(x, y, this.size);
      fill('#FFFFFF');
      circle(x + this.flenl, y - 5, this.size / 5);
      circle(x + this.flenr, y + 5, this.size / 5);
    pop();
  }
}

class NPC {
  constructor(name, x, y, skinColor, eyeColor, dialogue) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.skinColor = skinColor;
    this.eyeColor = eyeColor;
    this.size = 30;
    this.flenl = 5;
    this.flenr = 5;
    this.dialogue = dialogue;
    this.dialogueIndex = 0;
  }
  draw() {
    // Draw NPC facing player
    push();
      translate(this.x, this.y);
      let px = width/2 + player.x;
      let py = height/2 + player.y;
      let angle = atan2(py - this.y, px - this.x);
      rotate(angle);
      stroke(0);
      strokeWeight(1);
      fill(this.skinColor);
      circle(0, 0, this.size);
      fill(this.eyeColor);
      circle(this.flenl, -5, this.size / 5);
      circle(this.flenr,  5, this.size / 5);
    pop();
    this.drawPrompt();
  }
  isNear() {
    let px = width/2 + player.x;
    let py = height/2 + player.y;
    return dist(px, py, this.x, this.y) < 20;
  }
  drawPrompt() {
    if (this.isNear() && !dialogueOpen) {
      push();
        textAlign(CENTER);
        textSize(16);
        stroke(0); strokeWeight(1);
        fill(255);
        text(`Press 'E' to interact`, this.x, this.y - this.size - 10);
      pop();
    }
  }
}

function preload() {
  soundFormats('wav');
  audio = loadSound('r1.wav');
  sel = loadSound('sel.wav');
  main = loadSound('main.wav');
}

function setup() {
  const cnv = createCanvas(600, 600).parent('sketch-container');
  cnv.mousePressed(async () => {
    // resume the audio context
    await getAudioContext().resume();
    // start your title music (only once)
    if (!main.isPlaying() && showOverlay) {
      main.loop();
    }
    // remove this listener so it doesn’t restart every click:
    cnv.elt.onmousedown = null;
  });
  textFont('Comic Sans MS');
  {
    let x = 60;
    let y = 200;
    let nextHopTime = 0;

    drawHoppingBunny = function() {
      const now = millis();
      if (now >= nextHopTime) {
        // choose a random 2-px hop in one of 8 directions
        const dirs = [
          { dx: -4, dy:  0 }, { dx:  4, dy:  0 },
          { dx:  0, dy: -4 }, { dx:  0, dy:  4 },
          { dx: -4, dy: -4 }, { dx:  4, dy: -4 },
          { dx: -4, dy:  4 }, { dx:  4, dy:  4 },
        ];
        const { dx, dy } = random(dirs);
        x = constrain(x + dx, 0, width);
        y = constrain(y + dy, 0, height);
        // schedule next hop 1–3 seconds from now
        nextHopTime = now + random(500, 2000);
      }

      // draw the bunny at (x,y)
      push();
      translate(x, y);
      noStroke();
      push()
      fill('blue');
      ellipse(0, 5, 20, 14);    // body
      pop()
      fill('rgb(255,255,255)');
      ellipse(0, -5, 14, 14);   // head
      // ears
      push();
        translate(-4, -15);
        rotate(radians(-10));
        ellipse(0, 0, 6, 20);
      pop();
      push();
        translate(4, -15);
        rotate(radians(10));
        ellipse(0, 0, 6, 20);
      pop();
      // eye
      fill(100);
      ellipse(3, -7, 3, 3);
      ellipse(-3, -7, 3, 3);
      pop();
    };
  }
  player = new player1();

  // Create the start button
  startButton = createButton('Start');
  startButton.position(windowWidth / 2 - 30, windowHeight / 2 + 50);
  startButton.style('font-family', 'Comic Sans MS');
  startButton.mousePressed(startGame);

  // Houses
  houses = [
    { x: 160, y: 80,  w: 60, h: 60, color: '#654321', windows: floor(random(1, 3)) },
    { x: 140, y: 320, w: 60, h: 60, color: '#A0522D', windows: floor(random(1, 3)) },
    { x: 160, y: 450, w: 60, h: 60, color: '#808080', windows: floor(random(1, 3)) }
  ];

  // NPC dialogues
  const johnDialogue = ["I've been a nasty girl..."];
  const algeaDialogue = [
    "Welcome home Eleni, we are happy you're home!",
    "Happy birthday! It seems like a new neighbor is moving into the house across the street but we haven't met him yet.",
    "He seems like a nice southern guy.",
    "Maybe go talk to him to see if he needs any help."
  ];
  const howellDialogue = [
    "Oh heyy their Eleyni, what brings you heyer?", "Huhh?", "You live across the street?", "Now thayught is quite the coindideyence!", 
    "I just moved in heyer because I wanted to teach high school.", "I got a job at this nearby small school you've probably neyver heard of.", 
    "It's called the Winsor School?", "Anyway...", "Do I need heyelp?", "Funny you ayughsk, I was just thinkin' abouyought how to take the integral of a function of several variables when all of a sudden...", 
    "I stumbled upon this strange paper in the bush behind my house.", "Nayow I don't hayughv the time to work on this but maybe this will give ya something to do this summer."
  ];

  // Initialize NPCs
  npcs = [
    new NPC('Dad', 220, 200, '#E1C594', '#FFFFFF', johnDialogue),
    new NPC('Mom', 220, 240, '#F0D5B1', '#FFCCCC', algeaDialogue),
    new NPC('Howell', 500, 130, '#DDC2A0', '#888888', howellDialogue)
  ];
}

function draw() {
  if (showOverlay) {
    drawOverlay();
    return;
  }

  background('rgb(74,155,74)');
  drawStraightRoad(300);
  drawCar(270,millis()/10 % 1200,'blue')
  drawCar(320,600+200 + -millis()/12 % 1700,'red')

  square()
  
  // Player on top
  player.draw();
  // screen‐coords of the player
let px = width/2 + player.x;
let py = height/2 + player.y;



  drawMiniGarden(80, 180)
  drawHoppingBunny();

  // Draw houses + mirrors
  for (let h of houses) {
    drawHouse(h.x, h.y, h.w, h.h, h.color, h.windows);
    let mx = 600 - h.x - h.w;
    drawHouse(mx, h.y, h.w, h.h, h.color, h.windows);
  }
  // Brick house
  drawBrickHouse(140, 300 - roadW/2 - 10 - 60, 60, 60);

  for (let npc of npcs) npc.draw();

  // Vegetation
  drawBush(500, 100);
  drawBush(100, 500);
  drawTree(520, 450);
  drawTree(560, 400);
  drawTree(570, 490);
  drawTree(510, 520);
  drawTree(80, 80);
  
  push();
  textSize(15);
  fill('yellow')
  text("Eleni's Neighborhood", 20, 20);
  pop();
  if (dist(px, py, interactTree.x, interactTree.y) < interactTree.radius) {
  push();
    textAlign(CENTER);
    textSize(16);
    stroke(0);
    fill(255);
    text("Push 'E'", interactTree.x, interactTree.y - 40);
  pop();
}
  
  // Dialogue GUI
  if (dialogueOpen && activeNPC) drawDialogueGUI(activeNPC);
}

function drawOverlay() {
  background(50, 0, 50); // Purple background

  // Draw rainbow text
  let msg = "In Search of Elenia";
  let colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
  textSize(32);
  textFont('Comic Sans MS');
  textAlign(LEFT, CENTER);

  // compute start x so text is centered
  let totalWidth = 0;
  for (let ch of msg) totalWidth += textWidth(ch);
  let x = (width - totalWidth) / 2;
  let y = height / 2 - 50;

  for (let i = 0; i < msg.length; i++) {
    fill(colors[i % colors.length]);
    text(msg[i], x, y);
    x += textWidth(msg[i]);
  }
}

function startGame() {
  showOverlay = false;
  startButton.hide();
  if (main.isPlaying()) {
    main.stop();
  }
  if (!audio.isPlaying()) {
    audio.loop();
  }
}

function keyPressed() {
  if ((key === 'E' || key === 'e')) {
  // recompute px,py
  let px = width/2 + player.x;
  let py = height/2 + player.y;
  if (dist(px, py, interactTree.x, interactTree.y) < interactTree.radius) {
    window.open("https://rubikscu.be/", "_blank");
    return;   // so you don’t also open NPC dialogue
  }
}

  if ((key === 'E' || key === 'e') && !dialogueOpen) {
    sel.play()
    for (let npc of npcs) {
      if (npc.isNear()) {
        activeNPC = npc;
        dialogueOpen = true;
        activeNPC.dialogueIndex = 0;
        break;
      }
    }
  }
}

function mousePressed() {
  if (player.isClicked(mouseX, mouseY)) {
    // redirect anywhere you like:
    window.location.href = 'chubslab.html';
    return;   // don’t also open dialogue etc.
  }
  if (!dialogueOpen || !activeNPC) return;

  // GUI bounds
  let guiW = width * 0.8;
  let guiH = height * 0.4;
  let guiX = (width - guiW) / 2;
  let guiY = (height - guiH) / 2;
  let arrowSize = 20;
  let arrowY = guiY + guiH - arrowSize*2;
  let arrowX = width/2;

  // Next arrow
  if (activeNPC.dialogueIndex < activeNPC.dialogue.length - 1) {
    if (mouseX > arrowX + 10 && mouseX < arrowX + 10 + arrowSize &&
        mouseY > arrowY && mouseY < arrowY + arrowSize) {
      activeNPC.dialogueIndex++;
      return;
    }
  }
  // Prev arrow
  if (activeNPC.dialogueIndex > 0) {
    if (mouseX > arrowX - 10 && mouseX < arrowX - 10 + arrowSize &&
        mouseY > arrowY && mouseY < arrowY + arrowSize) {
      activeNPC.dialogueIndex--;
      return;
    }
  }
  // Close button
  let xSize = 20;
  let xX = guiX + guiW - xSize - 10;
  let xY = guiY + 10;
  if (mouseX > xX && mouseX < xX + xSize &&
      mouseY > xY && mouseY < xY + xSize) {
    let was = activeNPC.name;
    dialogueOpen = false;
    activeNPC = null;
    if (was === 'Howell') {
      alert("You've obtained a note!");
      window.open('strange_note.pdf');
    }
  }
}

function drawDialogueGUI(npc) {
  let guiW = width * 0.8;
  let guiH = height * 0.4;
  let guiX = (width - guiW) / 2;
  let guiY = (height - guiH) / 2;
  let arrowSize = 20;

  // Background
  fill(230);
  stroke(0);
  rect(guiX, guiY, guiW, guiH);

  // Portrait box
  let portraitW = guiW * 0.3;
  let portraitH = guiH * 0.8;
  let portraitX = guiX + 10;
  let portraitY = guiY + 10;
  fill(255);
  stroke(0);
  rect(portraitX, portraitY, portraitW, portraitH);

  // Portrait character (scaled)
  let portraitSize = portraitH * 0.5;
  push();
    let px = portraitX + portraitW/2;
    let py = portraitY + portraitH/2;
    translate(px, py);
    stroke(0);
    fill(npc.skinColor);
    circle(0, 0, portraitSize);
    fill(npc.eyeColor);
    let offX = (npc.flenl / npc.size) * portraitSize;
    let offY = (5 / npc.size) * portraitSize;
    let eyeD = (npc.size/5 / npc.size) * portraitSize;
    circle(offX, -offY, eyeD);
    circle(offX,  offY, eyeD);
  pop();

  // Name bar
  let nameH = 30;
  let nameY = portraitY + portraitH;
  fill(240);
  stroke(0);
  rect(portraitX, nameY, portraitW, nameH);
  noStroke();
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(16);
  text(npc.name, portraitX + portraitW/2, nameY + nameH/2);

  // Text area
  noStroke();
  fill(0);
  textAlign(LEFT, TOP);
  textSize(16);
  let textX = portraitX + portraitW + 20;
  let textY = portraitY + 20;
  let textW = guiW - portraitW - 40;
  let textH = portraitH;
  let dialog = npc.dialogue[npc.dialogueIndex];
  text(dialog, textX, textY, textW, textH);

  // Arrows
  fill(0);
  // Prev
  if (npc.dialogueIndex > 0) {
    triangle(
      width/2 - 20, guiY + guiH - arrowSize*2 + arrowSize/2,
      width/2 - 20 + arrowSize, guiY + guiH - arrowSize*2,
      width/2 - 20 + arrowSize, guiY + guiH - arrowSize*2 + arrowSize
    );
  }
  // Next
  if (npc.dialogueIndex < npc.dialogue.length - 1) {
    triangle(
      width/2 + 20, guiY + guiH - arrowSize*2,
      width/2 + 20, guiY + guiH - arrowSize*2 + arrowSize,
      width/2 + 20 + arrowSize, guiY + guiH - arrowSize*2 + arrowSize/2
    );
  }

  // Close X
  stroke(0);
  strokeWeight(2);
  let xSize = 20;
  let xX = guiX + guiW - xSize - 10;
  let xY = guiY + 10;
  line(xX, xY, xX + xSize, xY + xSize);
  line(xX + xSize, xY, xX, xY + xSize);
}

// —— DRAW HELPERS ——

function drawStraightRoad(cx) {
  stroke(0);
  strokeWeight(1);
  fill(200);
  rect(cx - roadW/2 - sideW, 0, sideW, height);
  rect(cx + roadW/2, 0, sideW, height);

  fill(50);
  rect(cx - roadW/2, 0, roadW, height);

  stroke(255, 204, 0);
  strokeWeight(4);
  line(cx, 0, cx, height);

  stroke(0);
  strokeWeight(1);
}

function drawHouse(x, y, w, h, bodyColor, windows) {
  stroke(0);
  strokeWeight(1);
  fill(bodyColor);
  rect(x, y, w, h);
  fill(lerpColor(color(bodyColor), color(0), 0.6));
  triangle(x, y, x + w, y, x + w/2, y - h/2);

  // windows
  let winW = w / 4;
  let winH = h / 4;
  fill('#F0FBFF');
  stroke(0);
  strokeWeight(1);
  let wy = y + h/2 - winH/2;
  if (windows === 1) {
    let wx = x + w/2 - winW/2;
    rect(wx, wy, winW, winH);
  } else {
    let wx1 = x + w/4 - winW/2;
    let wx2 = x + 3*w/4 - winW/2;
    rect(wx1, wy, winW, winH);
    rect(wx2, wy, winW, winH);
  }
}

function drawBrickHouse(x,y,w,h){
  stroke(0);strokeWeight(1);
  fill(200);rect(x,y,w/2,h);
  fill('#8B0000');rect(x+w/2,y,w/2,h);
  stroke(255);strokeWeight(2);
  for(let yy=y+10;yy<y+h;yy+=10) line(x+w/2,yy,x+w,yy);
  for(let xx=x+w/2+10;xx<x+w;xx+=20) line(xx,y,xx,y+h);
  stroke(0);strokeWeight(1);
}

function drawBush(x,y){
  stroke(0);strokeWeight(1);
  fill('#228B22');
  ellipse(x,y,50,30);
  ellipse(x+30,y+20,60,35);
}

function drawTree(x,y){
  stroke(0);strokeWeight(1);
  fill('#8B4513');
  rect(x,y,10,30);
  fill('#006400');
  ellipse(x+5,y-10,50,50);
}

function drawMiniGarden(x, y) {
  push();
  translate(x, y);
  stroke(0);            // black outline everywhere

  // 1) Wood border (slightly larger than 30×30)
  fill(181, 101, 29);   // warm wood tone
  rect(0, 0, 32, 32);

  // 2) Soil patch
  fill(136, 85, 0);     // rich brown
  rect(1, 1, 30, 30);

  // 3) Tomatoes (red circles)
  fill( 34, 139,  34);
  ellipse(8,  8, 6, 6);
  ellipse(12, 22, 6, 6);
  

  // 4) Herbs (green circles)
  fill(220,  20,  60);
  
  
  ellipse(22, 24, 6, 6);
  ellipse(24, 10, 6, 6);

  pop();
}

function drawCar(x, y, c) {
  push();
  translate(x, y);
  stroke(0);
  // 1) Car body
  
  
  // 2) Wheels (3×3 px)
  fill(0);         
  // front-left
  rect(-2,  -1, 3, 4);
  // front-right
  rect(10 - 1, -1, 3, 4);
  // rear-left
  rect(-2,  15 - 3, 3, 4);
  // rear-right
  rect(10 - 1, 15 - 3, 3, 4);
  fill(c);       
  rect(0, 0, 10, 15);
  
  pop();
}
