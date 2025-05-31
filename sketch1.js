// Lab Room Sketch - Birds Eye View

let player;
let npcs = [];
let dialogueOpen = false;
let activeNPC = null;
let barrierX;
let stairs = [];
let desk;
let computer;
let blinktoggle = false;
let showIntro = true;
let beginButton;
let showPuzzle = false;
let puzzleInput, puzzleSubmit, puzzleError;
let puzzleSolved = false;
let boardChar = '?';
let canvasX, canvasY;
let hippoNPC, pigNPC;
let pigResponseInput, pigResponseSubmit, pigResponseError;
let pigAnswered = false;
let haspwd     = false;    // flip to true when you want the computer‐GUI active
let pwdSolved  = false;   // turns true once they type the right password
let pwdInput, pwdSubmit, pwdError;

let teleporterActive   = false;
let teleporterMenuOpen = false;
let teleporter;  // { x,y,size }
let coordInput, coordSubmit, coordError;




// Staircase properties
const stairProps = { steps: 5, w: 5, h: 40 };

function preload() {
  soundFormats('wav');
  sel = loadSound('sel.wav')
  audio = loadSound('r2.wav');
}


function setup() {
  const cnv = createCanvas(600, 600).parent('sketch-container');
  canvasX = cnv.elt.offsetLeft;
canvasY = cnv.elt.offsetTop;
  // Invisible barrier down the middle
  barrierX = width / 2;
  
  // Initialize stairs centered on the barrier
  const startX = barrierX - (stairProps.steps * stairProps.w) / 2;
  const stairY = height * 0.7;
  for (let i = 0; i < stairProps.steps; i++) {
    stairs.push({ x: startX + i * stairProps.w, y: stairY, w: stairProps.w, h: stairProps.h });
  }
  beginButton = createButton('Begin');
  beginButton.position(windowWidth / 2 - 30, windowHeight / 2 + 40);
  beginButton.mousePressed(startGame);
  beginButton.style('font-size', '16px');
  beginButton.style('background-color', '#D6EAF8');
  beginButton.style('border', '1px solid #000');
  beginButton.style('font-family', 'Comic Sans MS');
  beginButton.hide();

  // Show the button after canvas is ready
  beginButton.show();
  puzzleInput = createInput().attribute('placeholder','Solve the equation');
puzzleInput.position(canvasX + windowWidth/2 - 100, canvasY + windowHeight/2 - 25).hide();

puzzleSubmit = createButton('Submit')
  .position(canvasX + windowWidth/2 +  20, canvasY + windowHeight/2)
  .mousePressed(checkPuzzle).hide();

puzzleError = createP('').style('color','red')
  .position(canvasX + width/2 - 100, canvasY + height/2 + 10)
  .hide();

  // … your existing setup code …
  teleporter = { 
    x: 50, 
    y: height - 50, 
    size:  40 
  };
  // PiggyOS password GUI
  pwdInput  = createInput().attribute('placeholder','Enter PiggyOS password');
  pwdSubmit = createButton('Submit').mousePressed(checkPwd);
  pwdError  = createP('').style('color','red');

  pwdInput.hide();
  pwdSubmit.hide();
  pwdError.hide();

  coordInput  = createInput().attribute('placeholder','Enter name');
  coordSubmit = createButton('Submit').mousePressed(checkCoord);
  coordError  = createP('').style('color','red');
  [coordInput, coordSubmit, coordError].forEach(el => el.hide());

    // add the froggy
  npcs.push(new FrogNPC(
    'Ricky',   // NPC name
    250, 280,   // x, y on your canvas
    [
      "I can't figure out why my bot is moving like this!",
      "Meanwhile fatty just sits over there and orders doordash...",
      "I can't wait for vacation..."
    ]
  ));

  pigNPC = 
  new PigNPC(
    'Chubs',
    550, 170,
    [
      "Eleni???",
      "You made it!!",
      "Welcome to my top secret lab in Scaife.",
      "Sorry for making that puzzle so hard, but you've confirmed my suspicion...",
      "You are the chosen one.",
      "Allow me to explain.",
      "I was recently approached by NASA...",
      "They claimed to have obtained a key to a mysterious realm known as",
      "Elenia...",
      "They told me they're getting intense quasiultraradioelectromagnetic signals of what they're claiming to be a 'grand treasure' from deep within this realm.",
      "So they want me, the top piggy scientist in the universe, to recruit a qualified team to search for this treasure.",
      "The plan was simple; I'd work out the calculations of the quasiultraradioelectromagnetic signals to obtain coordinates of the treasure,",
      "Ricky would work on developing a robo-companion to help us navigate the realm,",
      "And fatty... well... she was supposed recruit the team.",
      "I told her to cross-corelate the research papers of our contacts list with the scientific requirements this journey would demand in order to find the best team.",
      "But... fatty, being a dumbass, cross-corelated the actual names of our contacts with the name of the realm instead. She went home proud that day and housed 10 burgers.",
      "So that's how we landed on you.",
      "To be sure you were the 'chosen one' fatty had claimed, I developed an almost impossible puzzle whose solution would teleport you here.",
      "But you made it... so maybe fatty really was onto something because you really are the chosen one.",
      "Anyway, here's our problem now.",
      "See that old computer over there?",
      "On that computer is a highly important software: piggyOS, which is my scientific database where NASA sent the coordinates of the Elania portal.",
      "Only problem is... fatty changed the password and then forgot what it was...",
      "Burger brick.",
      "So... I got on the phone with the piggyOS team and asked if they could tell us the password.",
      "They said they wanted to verify my identity so they wanted me to solve this equation I have on the blackboard.",
      "But I'm suck... if only I could magically make someone appear and go to the blackboard and solve it for me..."
    ]
  )
  hippoNPC = 
  new HippoNPC(
    'Fatty',
    100, 150,
    [
      "Hamburger?",
      "*snores*",
      "Did they figure it out yet?",
      "Can you get my doordash for me?",
      "They told me to be in charge of the computer but i don't know what I'm doing.",
      "*farts*",
      "Oopsie!",
      "I wanna take a nap."
    ]
  )
  npcs.push(pigNPC, hippoNPC)
  // Desk on the left half
  // Computer sits on the desk

  // Initialize player in left half
  player = new player1();
  drawSmallScreen = makeSmallScreen({
    showFrames: 30,      
    blankFrames: 12,     
    finalBlankFrames: 60 
  });
  pigResponseInput  = createInput().attribute('placeholder','What does it say?');
  pigResponseSubmit = createButton('Submit').mousePressed(checkPigResponse);
  pigResponseError  = createP('').style('color','red');

  [pigResponseInput, pigResponseSubmit, pigResponseError].forEach(el => el.hide())
  drawLargeScreen = makeLargeScreen(120);
  // (Optional) Add NPCs here:
  // npcs.push(new NPC('Scientist', 150, 300, '#FFD07F', '#333333', ['Welcome to the lab!']));

}

function draw() {

  background(220); // light gray lab floor
  push();
  fill('gray')
  stroke(0);
  rect(300,0,600,600)
  pop();
  push();
  stroke(200,200,200);        // set the line color
  strokeWeight(2);      // (optional) make them a bit thicker
  for (let i = 1; i < 40; i++) {
    line(50 + i * 5, 0, 50 + i * 5, 600);
  }
pop();
  // Draw the desk and computer
  drawDesk(20, 70, 270, 50);
  drawBookshelf(350,50)
  drawComputer(50, 50);
  drawTransmitter(490, 410);
  drawSmallScreen(180, 19, blinktoggle);
  drawLargeScreen(170,50)
  drawBlackBoard(475, 50, 100, 80);
  drawSignalBars(400,480)
  drawOscilloscope(200,  535);
  drawBinaryTicker(540,  250);
  drawEmployeeBadge(340, 530);
  

  let qx = width/2 + player.x;
  let qy = height/2 + player.y;
  // monitor is at (x+30,y+5) size 60×40
  const compX = 50 + 30, compY = 50 + 5, compW = 60, compH = 40;
  const nearComp = haspwd && !pwdSolved
                 && qx > compX && qx < compX + compW
                 && qy > compY && qy < compY + compH;

  

  // Draw the staircase
  for (let s of stairs) {
    stroke(0);
    fill(180);
    rect(s.x, s.y, s.w, s.h);
  }
  drawRobot(250,200)
  // Draw player and NPCs
  player.draw();
  
  


  // Dialogue GUI if active
  for (let npc of npcs) npc.draw();
  if (dialogueOpen && activeNPC) drawDialogueGUI(activeNPC);
  let sx = width/2 + player.x,
    sy = height/2 + player.y,
    bx = 475, by = 50, bw = 100, bh = 80;
let showPuzzle = !puzzleSolved
               && sx > bx && sx < bx + bw
               && sy > by && sy < by + bh;

if (showPuzzle) {
  // dark half‐transparent
  push();
    fill(0,0,0,150);
    rect(0,0,width,height);
    fill(255);
    rect(width/2 - 150, height/2 - 75, 300, 150, 10);
  pop();

  puzzleInput.show();
  puzzleSubmit.show();
} else {
  puzzleInput.hide();
  puzzleSubmit.hide();
  puzzleError.hide();
}
if (nearComp) {
    // dark overlay + dialog box
    push();
      fill(0,0,0,150); rect(0,0,width,height);
      fill(255);        rect(width/2-150, height/2-60, 300, 120, 10);
      fill(0); textAlign(CENTER, CENTER); textSize(18);
      text('PiggyOS password', width/2, height/2-20);
    pop();

    // position & show the input/button/error
    pwdInput.position(windowWidth/2 - 100, windowHeight/2);
    pwdSubmit.position(windowWidth/2 +  20, windowHeight/2+30);
    pwdError.position(windowWidth/2 - 100, windowHeight/2 + 20);

    pwdInput.show();
    pwdSubmit.show();
    pwdError.show();
  } else {
    pwdInput.hide();
    pwdSubmit.hide();
    pwdError.hide();
  }
  if (showIntro) {
    push()
    noStroke()
  background('#BFD9FF'); // soft pastel blue
  textAlign(CENTER, CENTER);
  textSize(24);
  textFont('Comic Sans MS');
  fill(0);
  text("Level 2\nFloor C, Scaife Hall\nCarnegie Mellon", width / 2, height / 2 - 40);
  pop()
  return;
}

if (teleporterActive) {
    push();
      stroke(255,0,255);
      fill(200,0,200,100);
      ellipse(teleporter.x, teleporter.y, teleporter.size);
    pop();

    // collision test
    let px = width/2 + player.x;
    let py = height/2 + player.y;
    let d  = dist(px, py, teleporter.x, teleporter.y);
    if (d < (teleporter.size/2 + player.size/2)) {
      teleporterMenuOpen = true;
    }
  }

  // if inside teleporter, show the overlay + coords GUI
  if (teleporterMenuOpen) {
    // dark backdrop
    push();
      fill(0, 0, 0, 150);
      rect(0, 0, width, height);
      fill(255);
      rect(width/2 - 150, height/2 - 80, 300, 160, 10);
      fill(0);
      textAlign(CENTER, CENTER);
      textSize(20);
      text('Coordinates:', width/2, height/2 - 40);
    pop();

    // position & show the DOM elements
    coordInput
      .position(windowWidth/2 - 100, windowHeight/2 - 10)
      .show();
    coordSubmit
      .position(windowWidth/2 +  20, windowHeight/2 + 15)
      .show();
    coordError
      .position(windowWidth/2 - 100, windowHeight/2 + 20)
      .show();
  } else {
    coordInput.hide();
    coordSubmit.hide();
    coordError.hide();
  }
}

// Player class with barrier logic
class player1 {
  constructor() {
    this.x = -200;  // start left of barrier
    this.y = 200;
    this.vel = 2;
    this.size = 30;
    this.flenl = 5;
    this.flenr = 5;
  }
  draw() {
    // Compute proposed movement
    let newX = this.x;
    let newY = this.y;
    if (keyIsDown(87)) newY -= this.vel;
    if (keyIsDown(83)) newY += this.vel;
    if (keyIsDown(65)) newX -= this.vel;
    if (keyIsDown(68)) newX += this.vel;

    // Screen coords
    const oldSX = width/2 + this.x;
    const oldSY = height/2 + this.y;
    const newSX = width/2 + newX;
    const newSY = height/2 + newY;

    // Detect crossing of the invisible barrier at barrierX
    const crossingRight = oldSX < barrierX && newSX >= barrierX;
    const crossingLeft  = oldSX > barrierX && newSX <= barrierX;

    // Allow crossing only if on the stairs
    if ((crossingRight || crossingLeft) &&
        !( newSY > stairs[0].y && newSY < stairs[0].y + stairs[0].h &&
           newSX > stairs[0].x && newSX < stairs[stairs.length-1].x + stairs[0].w )) {
      newX = this.x; // block crossing
    }

    // Update position
    this.x = newX;
    this.y = newY;

    // Draw player facing mouse
    this.mainp(this.x, this.y);
  }
  mainp(x, y) {
    push();
      const angle = Math.atan2((mouseY - (height/2 + y)), (mouseX - (width/2 + x)));
      translate(width/2 + x, height/2 + y);
      rotate(angle);
      translate(-x - width/2, -y - height/2);

      stroke(0);
      strokeWeight(1);
      fill('#E1C594');
      circle(width/2 + x, height/2 + y, this.size);
      fill('#FFFFFF');
      circle(width/2 + x + this.flenl, height/2 + y - 5, this.size/5);
      circle(width/2 + x + this.flenr, height/2 + y + 5, this.size/5);
    pop();
  }
}


function drawDialogueGUI(npc) {
  let guiW = width * 0.8;
  let guiH = height * 0.4;
  let guiX = (width - guiW) / 2;
  let guiY = (height - guiH) / 2;
  let arrowSize = 20;
  push();
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
  if (npc === pigNPC
    && npc.dialogueIndex === npc.dialogue.length - 1
    && !pigAnswered && puzzleSolved) {

  // center of the window
  const cx = windowWidth  / 2 + 30;
  const cy = windowHeight / 2;

  // position the DOM elements centered horizontally,
  // and at the vertical center of the dialogue box
  const iw = pigResponseInput.width;
  pigResponseInput
    .position(cx - iw/2,       cy - 10)
    .show();

  pigResponseSubmit
    .position(cx + iw/2 + 10,  cy - 10)
    .show();

  pigResponseError
    .position(cx - iw/2,       cy + 20)
    .show();
} else {
  pigResponseInput.hide();
  pigResponseSubmit.hide();
  pigResponseError.hide();
}
  pop();
}




// NPC class (can add NPCs as needed)
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
    // Face the player
    push();
      translate(this.x, this.y);
      const px = width/2 + player.x;
      const py = height/2 + player.y;
      const angle = atan2(py - this.y, px - this.x);
      rotate(angle);
      stroke(0);
      strokeWeight(1);
      fill(this.skinColor);
      circle(0, 0, this.size);
      fill(this.eyeColor);
      circle(this.flenl, -5, this.size/5);
      circle(this.flenr,  5, this.size/5);
    pop();
    this.drawPrompt();
  }
  isNear() {
    const px = width/2 + player.x;
    const py = height/2 + player.y;
    return dist(px, py, this.x, this.y) < this.size;
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

class PigNPC extends NPC {
  constructor(name, x, y, dialogue) {
    super(name, x, y, '#FFC0CB', '#000000', dialogue);
    this.size = 30;
  }

  draw() {
    // compute angle toward the player
    let px = width/2 + player.x;
    let py = height/2 + player.y;
    let angle = atan2(py - this.y, px - this.x);

    push();
      translate(this.x, this.y);
      rotate(angle - PI/2);

      // now draw the pig centered at (0,0)
      stroke(0);
      strokeWeight(1);
      fill('#FFC0CB');                // pink body
      circle(0, 0, this.size);

      // ears
      fill('#FFC0CB');
      ellipse(-this.size*0.3, -this.size*0.4, this.size*0.3, this.size*0.2);
      ellipse( this.size*0.3, -this.size*0.4, this.size*0.3, this.size*0.2);

      // eyes
      fill(0);
      const eyeOff = this.size * 0.2;
      circle(-eyeOff, -eyeOff, 5);
      circle( eyeOff, -eyeOff, 5);

      // snout
      fill('#FF69B4');
      const snoutW = this.size * 0.4;
      const snoutH = this.size * 0.25;
      ellipse(0, this.size*0.1, snoutW, snoutH);
      // nostrils
      fill(0);
      circle(-snoutW*0.2, this.size*0.1, 4);
      circle( snoutW*0.2, this.size*0.1, 4);
    pop();

    this.drawPrompt();
  }
}

class HippoNPC extends NPC {
  constructor(name, x, y, dialogue) {
    super(name, x, y, '#9B59B6', '#000000', dialogue);
    this.size = 40;
  }

  draw() {
    let px = width/2 + player.x;
    let py = height/2 + player.y;
    let angle = atan2(py - this.y, px - this.x);

    push();
      translate(this.x, this.y);
      rotate(angle - PI/2);

      stroke(0);
      strokeWeight(1);
      fill('#9B59B6');
      circle(0, 0, this.size);

      // ears
      fill('#9B59B6');
      circle(-this.size * 0.35, -this.size * 0.35, this.size * 0.2);
      circle( this.size * 0.35, -this.size * 0.35, this.size * 0.2);

      // eyes
      fill(0);
      const eyeOff = this.size * 0.2;
      circle(-eyeOff, -eyeOff, 6);
      circle( eyeOff, -eyeOff, 6);

      // snout
      fill('#9B59B6');
      const snoutW = this.size * 0.6;
      const snoutH = this.size * 0.3;
      ellipse(0, this.size * 0.15, snoutW, snoutH);

      // nostrils
      fill(0);
      const nostOff = this.size * 0.1;
      circle(-nostOff, this.size * 0.15, 4);
      circle( nostOff, this.size * 0.15, 4);
    pop();

    this.drawPrompt();
  }
}

class FrogNPC extends NPC {
  constructor(name, x, y, dialogue) {
    super(name, x, y, '#00A000', '#FFFFFF', dialogue);
    this.size = 30;
  }

  draw() {
    let px = width/2 + player.x;
    let py = height/2 + player.y;
    let angle = atan2(py - this.y, px - this.x);

    push();
      translate(this.x, this.y);
      rotate(angle - PI/2);

      // body
      stroke(0);
      strokeWeight(1);
      fill('#00A000');
      circle(0, 0, this.size);

      // eyes
      const eo = this.size * 0.2;
      fill('#FFFFFF');
      circle(-eo, -eo, this.size * 0.2);
      circle( eo, -eo, this.size * 0.2);
      fill(0);
      circle(-eo, -eo, this.size * 0.1);
      circle( eo, -eo, this.size * 0.1);

      // frown
      noFill();
      stroke(0);
      strokeWeight(2);
      const mw = this.size * 0.5;
      arc(0, this.size * 0.15, mw, mw * 0.5, PI, TWO_PI);
    pop();

    this.drawPrompt();
  }
}



// Handle key press for interactions
function keyPressed() {
  if (key === 'E' || key === 'e') {
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

  // same GUI hit‐testing from your neighborhood code:
  let guiW = width * 0.8, guiH = height * 0.4;
  let guiX = (width - guiW)/2, guiY = (height - guiH)/2;
  let arrowSize = 20, arrowY = guiY + guiH - arrowSize*2, centerX = width/2;

  // Next
  if (activeNPC.dialogueIndex < activeNPC.dialogue.length - 1) {
    if (mouseX > centerX + 10 && mouseX < centerX + 10 + arrowSize &&
        mouseY > arrowY && mouseY < arrowY + arrowSize) {
      activeNPC.dialogueIndex++;
      return;
    }
  }
  // Prev
  if (activeNPC.dialogueIndex > 0) {
    if (mouseX > centerX - 10 && mouseX < centerX - 10 + arrowSize &&
        mouseY > arrowY && mouseY < arrowY + arrowSize) {
      activeNPC.dialogueIndex--;
      return;
    }
  }
  // Close X
  let xSize = 20,
      xX = guiX + guiW - xSize - 10,
      xY = guiY + 10;
  if (mouseX > xX && mouseX < xX + xSize &&
      mouseY > xY && mouseY < xY + xSize) {
    dialogueOpen = false;
    activeNPC = null;
    pigResponseInput.hide();
pigResponseSubmit.hide();
pigResponseError.hide();
  }
}




// Draw desk
function drawDesk(x, y, w, h) {
  push();
    stroke(0);
    fill('#A0522D');
    rect(x, y, w, h);
  pop();
}

// Draw computer with multicolored parts and wires
function drawComputer(x, y) {
  push();
    // Tower
    stroke(0);
    fill('#777');
    rect(x, y, 20, 40);
    // Monitor
    fill('#333');
    rect(x + 30, y + 5, 60, 40);
    fill('#0F0');
    rect(x + 35, y + 10, 50, 30);
    // Keyboard
    fill('#555');
    rect(x + 20, y + 50, 80, 10);
    // Wires
    stroke(0);
    line(x + 10, y + 40, x + 30, y + 25);
    line(x + 20, y + 60, x + 50, y + 60);
  pop();
}

function drawRobot(x, y) {
  // time in seconds
  let t = millis() / 1000;
  // horizontal sway amplitude
  let swayx = sin(cos(t*2 / 3)*2 * 2) * 20; // tweak 50 for movement range
  let swayy = cos(cos(t*2 / 3)*2 * 2) * 20; // tweak 50 for movement range

  push();
    translate(x + swayx, y+ swayy/2);
    
    // ensure all shapes get a black stroke
    stroke(0);
    strokeWeight(1);
    
    // body
    fill(180, 220, 255);
    rect(-15, -30, 30, 40, 5);
    
    // head
    fill(200);
    rect(-10, -50, 20, 20, 3);
    
    // eyes
    fill(0);
    ellipse(-5, -45, 5, 5);
    ellipse( 5, -45, 5, 5);
  fill('grey')
    circle(0,10,20)
    // arms, hugging the sides
    // left arm – horizontal line just outside left edge
    line(-15, -10, -35, -10);
    // right arm – horizontal line just outside right edge
    line( 15, -10,  35, -10);
    
    // animated mouth
    let mouthW = map(sin(t * 4)*0.5, -1, 1, 5, 20);
    fill(150, 0, 0);
    rect(-mouthW/2, -37, mouthW, 5, 2);
  pop();
}



function randomHexString(len) {
  const chars = '0123456789ABCDEF';
  let s = '';
  for (let i = 0; i < len; i++) {
    s += chars[floor(random(chars.length))];
  }
  return s;
}

function makeLargeScreen(interval = 120) {
  let hex = randomHexString(8);

  return function drawLargeScreen(x, y) {
    if (frameCount % interval === 0) {
      hex = randomHexString(8);
    }

    const w = 80, h = 50;
    const line1 = hex.substring(0, 4);
    const line2 = hex.substring(4, 8);

    push();
      stroke(150, 0, 0);
      strokeWeight(2);
      fill(50);
      rect(x, y, w, h, 4);

      fill(255, 255, 0);
      noStroke();
      textFont('monospace');
      textSize(12);
      textAlign(CENTER, CENTER);
      text(line1 + '\n' + line2, x + w/2, y + h/2);
    pop();
  };
}

function makeSmallScreen({
  showFrames = 30,
  blankFrames = 12,
  finalBlankFrames = 60
} = {}) {
  const words = [
    "01100110",
    "01100001",
    "01110100",
    "01110100",
    "01111001"
  ];
  const chunks = [];
  words.forEach(w => chunks.push(w.substring(0,4), w.substring(4,8)));

  let state = "show", idx = 0, counter = 0;

  // now takes a third parameter blinkEnabled
  return function drawSmallScreen(x, y, blinkEnabled = true) {
    // only advance the cycle when blinkEnabled
    if (blinkEnabled) {
      counter++;
      if (state === "show" && counter >= showFrames) {
        state = "blank"; counter = 0;
      } else if (state === "blank") {
        const dur = (idx === chunks.length - 1 ? finalBlankFrames : blankFrames);
        if (counter >= dur) {
          counter = 0;
          idx = (idx + 1) % chunks.length;
          state = "show";
        }
      }
    } else {
      // freeze on “show” state so it never blanks
      state = "show";
      // leave idx where it was (so it will stay on whatever chunk)
      // optionally reset counter = 0; if you want mouth‐open timing reset
    }

    // drawing
    const w = 60, h = 30;
    push();
      stroke(0,0,255);
      strokeWeight(2);
      fill(state === "blank" ? 0 : 50);
      rect(x, y, w, h, 4);

      if (state === "show") {
        fill(0,255,0);
        noStroke();
        textFont("monospace");
        textSize(16);
        textAlign(CENTER, CENTER);
        text(chunks[idx], x + w/2, y + h/2);
      }
    pop();
  };
}

function drawBlackBoard(x, y, w = 100, h = 80) {
  // proportions
  const border      = w * 0.08;   // ~8px when w=100
  const standHeight = h * 0.10;   // ~8px when h=80
  const chalkW      = w * 0.20;   // ~20px
  const chalkH      = chalkW * 0.20; // ~4px

  // 1) Outer border
  stroke(0);
  strokeWeight(2);
  fill(101, 67, 33);              // dark brown
  rect(x, y, w, h, 4);

  // 2) Chalkboard surface
  noStroke();
  fill(0, 100, 0);                // dark green
  rect(
    x + border, 
    y + border, 
    w - 2*border, 
    h - 2*border, 
    2
  );

  // 3) Stand below board
  stroke(0);
  strokeWeight(2);
  fill(101, 67, 33);
  rect(
    x + border, 
    y + h + border, 
    w - 2*border, 
    standHeight, 
    2
  );

  // 4) Piece of chalk on the stand
  noStroke();
  fill(255);
  rect(
    x + border + 2, 
    y + h + border + (standHeight - chalkH)/2, 
    chalkW, 
    chalkH, 
    2
  );

  // 5) Formula text
  noStroke();
  fill(255);
  textFont('Comic Sans MS');
  textSize(h * 0.3);              // ~24px when h=80
  textAlign(CENTER, CENTER);
  textSize(12)
  // Replace the last line:
text(`ΔU = Q - ${boardChar}`, x + w/2, y + h/2);

}


function startGame() {
  userStartAudio();
  if (audio && !audio.isPlaying()) {
    audio.loop();
  }
  showIntro = false;
  beginButton.hide();
}

function checkPuzzle() {
  if (puzzleInput.value().trim().toLowerCase() === 'w') {
    puzzleSolved = true;
    boardChar    = 'W';        // swap the “?” to “W”
    puzzleInput.hide();
    puzzleSubmit.hide();
    puzzleError.hide();
    sel.play();
    blinktoggle = true;

    // rewrite Chubs’s dialogue
    pigNPC.dialogue = [
      "Holy banana balls.",
      "Eleni... you.... you're a genius...",
      "I just called the piggyOS team back with the answer and they said it is correct!",
      "They said they are sending the password through our binary reciever at the computer.",
      "Why don't you go translate that into english for us and then report back the password to me",
      "What does it say?"
    ];
  } else {
    puzzleError.html('Incorrect').show();
  }
}


function checkPigResponse() {
  const ans = pigResponseInput.value().trim().toLowerCase();
  if (ans === 'fatty') {
    pigAnswered = true;
    pigResponseInput.hide();
    pigResponseSubmit.hide();
    pigResponseError.hide();
    sel.play();
    haspwd = true

    // now overwrite Chubs’s dialogue with the “next step” lines
    pigNPC.dialogue = [
      "...",
      "THE PASSWORD WAS FATTY????",
      "OH MY-",
      "Okay... breath...",
      "Well hey! Now we have the password...",
      "Can you go log into the computer for me and figure out the coordinates? I need to keep working on these calculations..."
    ];
    pigNPC.dialogueIndex = 0;
  } else {
    pigResponseError.html('Incorrect').show();
  }
}

function checkPwd() {
  const ans = pwdInput.value().trim().toLowerCase();
  if (ans === 'fatty') {           // or whatever your real password is
    teleporterActive = true;
    pwdSolved = true;
    pwdInput.hide();
    pwdSubmit.hide();
    pwdError.hide();
    sel.play();                           
    window.open("chubs_coordinates.pdf")
  } else {
    pwdError.html('Incorrect');
  }
}

function checkCoord() {
  const ans = coordInput.value().trim().toLowerCase();
  if (ans === 'lars anderson') {
    sel.play();
    // clean up the menu
    teleporterMenuOpen = false;
    coordInput.hide();
    coordSubmit.hide();
    coordError.hide();
    // redirect to index2.html
    window.location.href = 'larspark.html';
  } else {
    coordError.html('Incorrect').show();
  }
}

function drawBookshelf(x, y) {
  push()
  stroke(0)
  // 1) Outer frame
  fill(139, 69, 19);           // wood brown
  rect(x, y, 100, 100);

  // 2) Backboard
  fill(245, 222, 179);         // lighter wood
  rect(x + 5, y + 5, 90, 90);

  // 3) Shelves
  fill(139, 69, 19);
  rect(x + 5, y + 30, 90, 4);
  rect(x + 5, y + 65, 90, 4);

  // 4) Books on top shelf (just under the top of the frame)
  fill('#e74c3c'); rect(x + 10, y + 10, 15, 15);
  fill('#3498db'); rect(x + 30, y + 10, 15, 15);
  fill('#f1c40f'); rect(x + 50, y + 10, 15, 15);
  fill('#2ecc71'); rect(x + 70, y + 10, 15, 15);

  // 5) Books on middle shelf
  fill('#9b59b6'); rect(x + 10, y + 40, 15, 20);
  fill('#e74c3c'); rect(x + 30, y + 40, 15, 20);
  fill('#3498db'); rect(x + 50, y + 40, 15, 20);
  fill('#f1c40f'); rect(x + 70, y + 40, 15, 20);

  // 6) Books on bottom “shelf” (floor of frame)
  fill('#2ecc71'); rect(x + 10, y + 75, 15, 15);
  fill('#9b59b6'); rect(x + 30, y + 75, 15, 15);
  fill('#e74c3c'); rect(x + 50, y + 75, 15, 15);
  fill('#3498db'); rect(x + 70, y + 75, 15, 15);
  pop();
}
function drawTransmitter(x, y) {
  const w = 80, h = 80;
  push();
  translate(x, y);

  // 1) Base box (the “device”)
  fill(50);
  stroke(200);
  rect(w * 0.25, h * 0.4, w * 0.5, h * 0.5, 5);

  // 2) Antenna
  stroke(200);
  strokeWeight(2);
  const ax = w * 0.5, ay = h * 0.4;
  line(ax, ay, ax, ay - h * 0.25);
  fill(255);
  noStroke();
  circle(ax, ay - h * 0.25, 8);

  // 3) Pulsing signal-waves
  noFill();
  for (let i = 0; i < 3; i++) {
    let phase = (frameCount * 2 + i * 20) % 60;
    let r = map(phase, 0, 60, 10, 30);
    let alpha = map(r, 10, 30, 255, 0);
    stroke(0, 255, 0, alpha);
    strokeWeight(1);
    circle(ax, ay - h * 0.25, r);
  }

  // 4) Blinking LED on device
  let ledOn = (frameCount % 60) < 30;
  fill(ledOn ? 255 : 100, 0, 0);
  noStroke();
  circle(w * 0.25 + 10, h * 0.4 + 10, 8);

  // 5) Scrolling data bars
  let barCount = 5;
  let bw = (w * 0.5) / barCount;
  fill(0, 255, 255);
  noStroke();
  for (let i = 0; i < barCount; i++) {
    let bx = w * 0.25 + i * bw;
    let barH = map((frameCount * 3 + i * 20) % 100, 0, 100, 5, h * 0.2);
    stroke(0)
    rect(bx, h * 0.9 - barH, bw * 0.6, barH);
  }

  pop();
}

function drawNetworkHub(x, y) {
  const size = 120, R = 40;
  push();
    fill(100,0,0)
    stroke(200);
    rect(x, y, size, size);

    translate(x + size/2, y + size/2);
    fill(100); stroke(200);
    circle(0, 0, R);

    let n = 6, step = TWO_PI / n;
    for (let i = 0; i < n; i++) {
      let a  = i * step + frameCount * 0.005;
      let nx = cos(a) * (R * 1.2);
      let ny = sin(a) * (R * 1.2);
      stroke(200);
      line(0, 0, nx, ny);
      noStroke();
      let pulse = map(sin(frameCount * 0.1 + i), -1, 1, 4, 12);
      fill(0, 255, 200);
      circle(nx, ny, pulse);
    }
  pop();
}

function drawSignalBars(x, y) {
  const barCount = 20, barW = 3, spacing = 6, hMax = 80;
  const panelW = barCount * (barW + spacing) - spacing;
  const panelH = hMax + 20;
  push();
    stroke(200); 
  

    translate(x, y + 10);
  fill(0);
  stroke(100);
  rect(-10, -10, panelW+20, hMax+20);
    fill(0,50,0)
    
    rect(0, 0, panelW, hMax);
    for (let i = 0; i < barCount; i++) {
      let h = map(noise(frameCount * 0.02 + i), 0, 1, 10, hMax);
      noStroke(); fill(255, 255, 0);
      rect(i * (barW + spacing), hMax - h, barW, h);
    }
  pop();
}

function drawBinaryTicker(x, y) {
  const w = 50, h = 150, lineH = 14;
  push();
    stroke(200); noFill();
    rect(x, y, w, h);

    translate(x, y);
    fill(0); rect(0, 0, w, h);

    textSize(12);
    textFont('monospace');
    fill(0, 255, 0);
    let rows = floor(h / lineH);
    for (let i = 0; i < rows; i++) {
      let bit = floor(noise(frameCount * 0.05 + i) * 2);
      text(bit, 5, i * lineH + lineH);
    }
  pop();
}

function drawOscilloscope(x, y) {
  const w = 80, h = 50;
  push();
    stroke(200); 
    fill(0)
  
    rect(x, y, w, h);

    translate(x, y);
  push()
    noFill();
    stroke(0, 255, 0);
    rect(0, 0, w, h);
  pop()
  circle(0,50,20)
  circle(80,50,20)

    noFill();
    beginShape();
      for (let i = 0; i < w; i++) {
        let angle = frameCount * 0.05 + i * 0.1;
        let yoff  = map(sin(2*sin(angle*2 + 100)*cos(angle)), -1, 1, h * 0.2, h * 0.8);
        vertex(i, yoff);
      }
    endShape();
  
  pop();
}
function drawEmployeeBadge(x, y) {
  const badgeSize = 60;      // overall diameter
  push();
    translate(x, y);

    // 1) Gold badge plate
    stroke(0);
    strokeWeight(1);
    fill(255, 215, 0);
    ellipse(0, 0, badgeSize, badgeSize);

    // 2) Red ribbon tails
    noStroke();
    fill(200, 0, 0);
    beginShape();
      vertex(-badgeSize*0.3, badgeSize*0.5-10);
      vertex(-badgeSize*0.15, badgeSize*0.9);
      vertex(0, badgeSize*0.7);
      vertex( badgeSize*0.15, badgeSize*0.9);
      vertex( badgeSize*0.3, badgeSize*0.5-10);
    endShape(CLOSE);

    // 3) “Employee of the Month” text
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(badgeSize * 0.08);
    text("employee\nof the \nmonth", 0, -badgeSize * 0.3);

    // 4) Frog face (scaled down)
    const s  = badgeSize * 0.4;   // face diameter
    const fy = badgeSize * 0.05;  // slight vertical offset

    // face circle
    stroke(0);
    strokeWeight(1);
    fill('#00A000');
    circle(0, fy, s);

    // eyes
    const eo = s * 0.2;
    fill('#FFFFFF');
    noStroke();
    circle(-eo, fy - eo, s * 0.2);
    circle( eo, fy - eo, s * 0.2);
    fill(0);
    circle(-eo, fy - eo, s * 0.1);
    circle( eo, fy - eo, s * 0.1);

    // frown
    noFill();
    stroke(0);
    strokeWeight(2);
    arc(0, fy + s * 0.15, s * 0.5, (s * 0.5) * 0.5, PI, TWO_PI);

  pop();
}


