// Three-Room Scene - p5.js Sketch

let cnv;
let player;
let npcs = [];
let dialogueOpen = false;
let activeNPC = null;
let room = 0;
let passcodeGranted = false;
let passcodeInput, passcodeSubmit, passcodeError;
let stars = [];
const NUM_STARS = 300;
let showIntro = true;
let beginButton;
let audioR4;
let bgPlanets = [];
let techno5ProxActive = false;
let accessInput, accessButton, accessError;
let prevRoom = 0;


function preload() {
  soundFormats('wav');
  sel       = loadSound('sel.wav');
  audioR4   = loadSound('r4.wav');
  kingSound = loadSound('king.wav');    // ← NEW: load the "king.wav" file
}



function setup() {
  // Canvas variable for CSS centering
  cnv = createCanvas(600, 600).parent('sketch-container');
  textFont('Comic Sans MS'); // global Comic Sans

  // Generate stars for sky
  for (let i = 0; i < NUM_STARS; i++) {
    stars.push({
      x: random(width),
      y: random(0, height / 3+50),
      si: random(1, 3),
      color: random(['#FFFFFF', '#FFFF99', '#FF99FF'])
    });
  }
  

  // … your existing setup …
  // make 5–10 floating planets
  for (let i = 0; i < 8; i++) {
    let sz    = random(10, 30);
    let posY  = random(0, height/3);        // up in the sky
    let posX  = random(-sz, 1000);
    let col   = color(random(50,200), random(50,200), random(50,200), 200);
    let speed = random(0.1,0.5)
    bgPlanets.push(new BackgroundPlanet(posX, posY, sz, col, speed));
  }


  // Initialize player in left room
  player = new Player(50, height / 2);

  // Gatekeeper in Room 0
  let gate = new GuardNPC('Gatekeeper', width - 100, height / 2,
    [
  "Ahh... it cannot be... you—I—I mean, *thou*—art she.",
  "The airi stills, the groundi holds its breath... welcome, traveler, to Elenia.",
  "Could it be... the one foretold in the misted circuits of the Archive Core? The Eleni?",
  "Forgive mine awe, but thy presence stirreth what rusted honor remains in this old guardi.",
  "And yet—I am boundi by code and duty.",
  "The gate to the inner sanctum may not open to just *any* radiant beingi who walketh in from the void.",
  "To prove thou art the one true Eleni, thou must activate the Shrine of Veritas—the white machinei that hums over therei.",
  "It will demand a key. Not one that can be foundi, nor stolen, nor known.",
  "It is said that only a human, guided by intuitioni and the spark of unreason, could guess it without a single clue.",
  "And so... if thou truly art she... then go. Enter the key. And let the Shrinei decide.",
  "If thou truly art the Eleni, thou shalt solve the Shrine’s riddle without guidancei.",
  "Then, and only then, must thou returni to me.",
  "Bring me the twentieth wordi that the Shrinei speaketh once its riddle is undone.",
  "Only then shall this gate yield, and the path to the inner realm open before thee.",
  "To our almighty King of Elenia, you will see..."

]
  );
  gate.room = 0;
  npcs.push(gate);




  // Hallway guards in Room 1
  let l1 = new GuardNPC('Lireni', 150, 360, ['By the starsi—what is this?!']);
l1.room = 1; npcs.push(l1);

let a1 = new GuardNPC('Amari', 110, 350, ['Heavensi—she walks among us?!']);
a1.room = 1; npcs.push(a1);

let s1 = new GuardNPC('Sereni', 350, 550, ['By the Olde Circuiti—could it be?!']);
s1.room = 1; npcs.push(s1);

let m1 = new GuardNPC('Martini', 500, 500, ['The prophecyi… it cometh true!']);
m1.room = 1; npcs.push(m1);

let t1 = new GuardNPC('Talari', 550, 530, ['I… I cannot believet it!']);
t1.room = 1; npcs.push(t1);




  const rugW     = 200;
const rugLeft  = width/2 - rugW/2;
const rugRight = rugLeft + rugW;
const topY     = height/2 + 50;
const bottomY  = height;
const leftX    = rugLeft  - 60;
const rightX   = rugRight + 60;

for (let i = 0; i < 3; i++) {
  let y = map(i, 0, 2, topY + 40, bottomY - 40);

  let gL = new KGuard(`Kings Guardi L${i+1}`, leftX,  y, ['*whispers in shock*']);
  gL.room = 2;
  npcs.push(gL);

  let gR = new KGuard(`Kings Guardi R${i+1}`, rightX, y, ['*whispers in shock*']);
  gR.room = 2;
  npcs.push(gR);
}

let king = new KingNPC(
  'Penguin',
  width/2,
  height/2 - 180,
  ["Quack.",
  "You finally made it.",
  "Took you long enough — I was starting to worry you’d get distracted by jellycats in a shop window or a cvs coupon...",
  "But you didn’t.",
  "You followed the clues.",
  "You trusted me, like you always have.",
  "You’ve turned twenty.",
  "That means… well, more than you think.",
  "Elenia was never mine.",
  "I’ve just been keeping the throne warm.",
  "The realm waits for its real ruler.",
  "And you, eleni, you’re right on time.",
  "I built it up, piece by piece, while you grew up.",
  "Protected it.",
  "Guarded it.",
  "Until the day came when you’d be ready to see it for what it really is — not a fantasy, but a gift.",
  "Yours.",
  "So — happy birthday, Your Majesty.",
  "The throne’s been waiting.",
  "Don’t worry… I’ll still be around.",
  "I make an excellent penguin advisor.",
  "Especially if there are snacks.",
  "Don't tell fatty though...",
  "But before you sit, let me tell you something important.",
  "Ruling this realm isn’t just about magic and dreams.",
  "It’s about how you carry yourself out there — in the real world.",
  "Elenia is a reflection, you see.",
  "When you walk with courage, it blooms.",
  "When you let your heart sing, it listens.",
  "And when you believe in yourself, even a little… the stars here shine brighter.",
  "You turned twenty today.",
  "And that’s not an ending — it’s a beginning...",
  "You’ve outgrown the map someone else drew for you.",
  "Now, you get to draw your own.",
  "So take the throne — not because you're finished growing, but because you're finally starting to grow on your own terms.",
  "Your world is all yours now, Eleni.",
  "Live boldly. Choose gently. Stay weird.",
  "And one more thing...",
  "I have just one more gift for you.",
  "But this prize doesn’t come for free.",
  "Solve this last puzzle — and you may find yourself one treasure richer..."
]);
king.room = 2;
npcs.push(king);




  // Passcode input GUI
  passcodeInput = createInput().attribute('placeholder', 'Enter passcode');
  passcodeSubmit = createButton('Submit').mousePressed(checkPasscode);
  passcodeError = createP('').style('color', 'red');
  [passcodeInput, passcodeSubmit, passcodeError].forEach(el => el.hide());

  // start‐screen button
beginButton = createButton('Start');
beginButton.position(windowWidth/2 - 30, windowHeight/2 + 40);
beginButton.style('font-family','Comic Sans MS');
beginButton.style('font-size','16px');
beginButton.hide();
beginButton.mousePressed(() => {
  showIntro = false;
  beginButton.hide();
  audioR4.loop();
});

  // TechnoBob5 proximity GUI
  accessInput   = createInput().attribute('placeholder','Enter access key');
  accessButton  = createButton('Enter').mousePressed(checkTech5);
  accessError   = createP('').style('color','red');

  [ accessInput, accessButton, accessError ].forEach(el => el.hide());

}

function draw() {
  background(0);

  if (showIntro) {
    background('#d2ffd4');
    textFont('Comic Sans MS');
    textAlign(CENTER, CENTER);
    textSize(24);
    fill(0);
    text("Level 4: Elenia", width/2, height/2 - 20);
    beginButton.show();
    return;          // skip the rest of draw until they press Start
  }

  // Draw current room
  if (room === 0) drawRoom0();
  else if (room === 1) drawRoom1();
  else if (room === 2) drawRoom2();

  // Draw only relevant NPC
    // Draw only relevant NPCs
  for (let npc of npcs) {
  if (npc.room === room) {
    npc.draw();
  }
}



  // Draw player
  player.draw();


  


  // Interaction / dialogue
  if (dialogueOpen && activeNPC) {
    drawDialogueGUI(activeNPC);
    if (activeNPC.name === 'Gatekeeper' && !passcodeGranted) {
      // Passcode GUI under dialogue
      const x = windowWidth / 2 - 70;
      const y = windowHeight / 2 + 20;
      passcodeInput.position(x, y).show();
      passcodeSubmit.position(x + passcodeInput.width + 10, y).show();
      passcodeError.position(x, y + 30).show();
    }
    return;
  }

  // Hide GUI when not in dialogue
  [passcodeInput, passcodeSubmit, passcodeError].forEach(el => el.hide());

  // Movement
  let speed = 2;
  if (keyIsDown(87)) player.y -= speed;
  if (keyIsDown(83)) player.y += speed;
  if (keyIsDown(65)) player.x -= speed;
  if (keyIsDown(68)) player.x += speed;
  player.x = constrain(player.x, 0, width);
  player.y = constrain(player.y, 0, height);

  const bob5X = 250 + 40, bob5Y = 150 + 40;
  const d5    = dist(player.x, player.y, bob5X, bob5Y);
  if (room === 0 && d5 < 50) {
    techno5ProxActive = true;
  } else {
    techno5ProxActive = false;
    [accessInput, accessButton, accessError].forEach(el => el.hide());
  }

  if (techno5ProxActive) {
    // overlay + GUI drawing (but **no return** any more!)
    push(); fill(0,0,0,150); rect(0,0,width,height); pop();
    textFont('Comic Sans MS');
    textSize(18);
    fill(255);
    textAlign(CENTER, CENTER);
    text('Enter Access Key', width/2, height/2 - 40);

    accessInput.position(windowWidth/2 - 80, windowHeight/2 - 10).show();
    accessButton.position(windowWidth/2 + 40, windowHeight/2 +15).show();
    accessError.position(windowWidth/2 - 80, windowHeight/2 + 20).show();
  }



    // Prevent walking into forbidden zones
  if (room === 0) {
    player.y = max(player.y, height/3 + player.size/2);
  }
  if (room === 1) {
    // keep player on the floor only
    player.y = max(player.y, height/2 + player.size/2);
  }


  // Room transitions
  if (room === 0 && passcodeGranted && player.x >= width - 10) {
    room = 1;
    player.x = 10;
  } else if (room === 1 && player.x >= width - 10) {
    room = 2;
    player.x = 300;
    player.y = 550;

  }


  if (room !== prevRoom) {
  // We just entered a new room:
  if (room === 1 || room === 2) {
    // Stop the "r4.wav" that was playing in Room 0 (if it is playing)
    if (audioR4.isPlaying()) {
      audioR4.stop();
    }
    // Loop the "king.wav" if not already looping
    if (!kingSound.isPlaying()) {
      kingSound.loop();
    }
  } else if (room === 0) {
    // We went back to Room 0: stop kingSound, restart audioR4
    if (kingSound.isPlaying()) {
      kingSound.stop();
    }
    if (!audioR4.isPlaying()) {
      audioR4.loop();
    }
  }
  prevRoom = room;  // update for next frame
}
}

// Room 0: Planet surface + sky
function drawRoom0() {
  stars.forEach(s => {
  s.x = (s.x + 0.2) % width;
});
  // Sky
  fill(0);
  rect(0, 0, width, height / 3);
  noStroke();
  for (let s of stars) {
    fill(s.color);
    circle(s.x, s.y, s.si);
  }
  for (let p of bgPlanets) {
    p.update();
    p.draw();
  }
  push()

  fill('yellow')
  circle((tan(millis()/10000 + 20)/0.1 - 100) % 800, 50, 10)
  pop()

  // Wide planet surface (stretched and lowered)
  fill('#00BFFF');
  ellipse(width / 2+100, height * 0.85+50, width * 2, height * 1.2);
  drawTechnoBob1( 490, 550);
  drawTechnoBob3(430, 510);


drawTechnoBob2(250, 80);

drawTechnoBob4(250, 110);
drawTechnoBob5(250, 150);

  // Gate (brick detail)
  drawBrickWall(width - 50, height / 3, 50, height * 2 / 3);
  drawAlien(400, 200, '#d2deff', 1.45);
  drawAlien(160, 500, '#d2f9ff', 5);

}

function drawRoom1() {
  // Wall (top half)
  push()
  fill('#444');
  rect(0, 0, width, height / 2);

  // Floor (bottom half)
  fill('#222');
  rect(0, height / 2, width, height / 2);

  // Rug
  fill('red');
  rect(100, height / 2 + 20, width - 200, height / 2 - 40);
  stroke('yellow'); strokeWeight(3);
  noFill();
  rect(100, height / 2 + 20, width - 200, height / 2 - 40);
  noStroke();

  // Picture frames
  drawPortraitOfElenia(120, 60);
  drawPoemPlaque(360, 60);

  // Candles
  drawWallCandle(80, 60);
  drawWallCandle(520, 60);
  pop()
  drawSign(width/2-60, height/2-60, 'King of Elenia');
}

function drawRoom2() {
  background('#331111');

  // → draw a vertical rug leading up to the throne
  drawThroneRug();

  // → then the throne
  drawThrone(width/2, height/2 - 150);



    // → draw all Room 2 NPCs
  for (let npc of npcs) {
    if (room === 2 && npc.room === 2) {
      npc.draw();
    }
  }

}



function drawBrickWall(x, y, w, h) {
  fill('#888'); rect(x, y, w, h);
  stroke(0);
  for (let i = 0; i <= h; i += 20) line(x, y + i, x + w, y + i);
  for (let j = 0; j <= w; j += 40) line(x + j, y, x + j, y + h);
}

function keyPressed() {
  if ((key === 'E' || key === 'e') && !dialogueOpen) {
    for (let npc of npcs) {
      if (
         npc.room === room &&
         dist(player.x, player.y, npc.x, npc.y) < npc.size
      ) {
        sel.play();
        activeNPC      = npc;
        dialogueOpen   = true;
        npc.dialogueIndex = 0;
        break;
      }
    }
  }
}







function mousePressed() {
  if (!dialogueOpen || !activeNPC) return;
  // Detect clicks on arrows & close X (simplified)
  let guiW = width * 0.8;
  let guiH = height * 0.4;
  let guiX = (width - guiW) / 2;
  let guiY = (height - guiH) / 2;
  let arrowSize = 20;
  // Close X
  let xSize = 20;
  let xX = guiX + guiW - xSize - 10;
  let xY = guiY + 10;
  if (mouseX > xX && mouseX < xX + xSize && mouseY > xY && mouseY < xY + xSize) {
    if (activeNPC instanceof KingNPC) {
      // Immediately navigate to the PDF (causing a download or open)
      window.location.href = 'final_puzzle.pdf';
    }
    dialogueOpen = false;
    activeNPC = null;
    
    return;
  }
  // Next arrow
  let centerX = width / 2;
  let arrowY = guiY + guiH - arrowSize * 2;
  if (activeNPC.dialogueIndex < activeNPC.dialogue.length - 1 &&
      mouseX > centerX + 10 && mouseX < centerX + 10 + arrowSize &&
      mouseY > arrowY && mouseY < arrowY + arrowSize) {
    activeNPC.dialogueIndex++;
    return;
  }
  // Prev arrow
  if (activeNPC.dialogueIndex > 0 &&
      mouseX > centerX - 20 && mouseX < centerX - 20 + arrowSize &&
      mouseY > arrowY && mouseY < arrowY + arrowSize) {
    activeNPC.dialogueIndex--;
    return;
  }
}

function checkPasscode() {
  if (passcodeInput.value().trim() === 'elenia') {
    passcodeGranted = true;
    sel.play();
    let g = npcs.find(n => n.name === 'Gatekeeper');
    g.dialogue = ["The Shrinei hath spoken. The wordi is true. The prophecy breathes againi.",
  "Holy banana balls.",
  "Forgive mine tongue—I... I am undonei.",
  "For generations uncountedi, we have waited—through silence, through rust, through reboot and ruin.",
  "Many came with fire in their eyesi, yet none bore the spark thou now carriest in thy voice.",
  "To witness this momenti... is to see our code fulfilledi.",
  "Go now, past the gatei behind me. The path is thine.",
  "The King waiteth in the Throne Room. He hath dreamt of thee in static and stormi.",
  "May the starsi bend low to watch thy step."];
    dialogueOpen = false;
  } else {
    passcodeError.html('Incorrect');
  }
}

class Player {
  constructor(x, y) {
    this.x = x; this.y = y; this.size = 30;
    this.flenl = 5; this.flenr = 5;
  }
  draw() {
    const angle = atan2(mouseY - this.y, mouseX - this.x);
    push(); translate(this.x, this.y); rotate(angle); translate(-this.x, -this.y);
    stroke(0); fill('#E1C594'); circle(this.x, this.y, this.size);
    fill('#FFFFFF'); circle(this.x + this.flenl, this.y - 5, this.size/5);
                     circle(this.x + this.flenr, this.y + 5, this.size/5);
    pop();
  }
}

class NPC {
  constructor(name, x, y, dialogue) {
    this.name = name; this.x = x; this.y = y; this.size = 30;
    this.skinColor = '#FFC0CB'; this.eyeColor = '#000000';
    this.dialogue = dialogue; this.dialogueIndex = 0;
  }
  draw() {
    const angle = atan2(player.y - this.y, player.x - this.x);
    push(); translate(this.x, this.y); rotate(angle + PI/2); translate(-this.x, -this.y);
    stroke(0); fill(this.skinColor); circle(this.x, this.y, this.size);
    fill(this.eyeColor); circle(this.x + this.size*0.2, this.y - this.size*0.2, this.size/5);
    circle(this.x - this.size*0.2, this.y - this.size*0.2, this.size/5);
    pop();
    this.drawPrompt();
  }
  drawPrompt() {
    if (dist(player.x, player.y, this.x, this.y) < this.size) {
      push(); textFont('Comic Sans MS'); textAlign(CENTER);
      textSize(16); fill(255); text(`Press 'E' to interact`, this.x, this.y - this.size - 10);
      pop();
    }
  }
}

class GuardNPC extends NPC {
  constructor(name, x, y, dialogue) {
    super(name, x, y, dialogue);
    this.size = 40;
    this.skinColor = '#D8BFD8'; this.eyeColor = '#000000';
  }
  draw() {
    const angle = atan2(player.y - this.y, player.x - this.x);
    push(); translate(this.x, this.y); rotate(angle + PI/2); translate(-this.x, -this.y);
    stroke(0); fill(this.skinColor); circle(this.x, this.y, this.size);
    fill(this.eyeColor); circle(this.x + this.size*0.2, this.y - this.size*0.2, this.size/5);
    circle(this.x - this.size*0.2, this.y - this.size*0.2, this.size/5);
    circle(this.x, this.y + this.size*0.001, this.size/6);
    pop();
    this.drawPrompt();
  }
}


class KGuard extends GuardNPC {
  constructor(name, x, y, dialogue) {
    super(name, x, y, dialogue);
    this.size      = 40;
    this.skinColor = '#FFCCCC';  // pastel red
    this.eyeColor  = '#000000';
    this.room       = 2;
  }

  draw() {
    // point towards player
    const angle = atan2(player.y - this.y, player.x - this.x);

    push();
      // move + rotate so “forward” is facing the player
      translate(this.x, this.y);
      rotate(angle + PI/2);

      // 2) head circle
      push()
      stroke(0);
      fill(this.skinColor);
      circle(0, 0, this.size);
      pop()

      // 1) large “rear” eye (drawn first so it sits behind the head)
      
      fill(this.eyeColor);
      let largeEyeRadius = this.size * 0.2;
      // place it halfway down the back of the head
      circle(0,  this.size * 0.4-17, largeEyeRadius);

      

      // 3) three small “front” eyes in a row
      fill(255);
      let smallEyeRadius = this.size * 0.1;
      let dx = this.size * 0.2;
      let dy = -this.size * 0.2;
      circle(-dx, dy, smallEyeRadius);
      circle(   0, dy-3, smallEyeRadius);
      circle( dx, dy, smallEyeRadius);

    pop();

    // keep the “Press E” prompt working
    this.drawPrompt();
  }
}


class KingNPC extends NPC {
  constructor(name, x, y, dialogue) {
    super(name, x, y, dialogue);
    this.size      = 60;              // a bit larger
    this.skinColor = '#CCFFCC';       // pastel green
    this.eyeColor  = '#000000';
    this.room      = 2;
  }

  draw() {
    // face the player, using your rotate tweak
    const angle = atan2(player.y - this.y, player.x - this.x);

    push();
      translate(this.x, this.y);
      rotate(angle - PI/2);

      // 1) body
      stroke(0);
      fill(this.skinColor);
      circle(0, 0, this.size);

      // 2) eyes
      noStroke();
      fill(this.eyeColor);
      let eyeR = this.size * 0.06;
      let ex   = this.size * 0.2;
      let ey   = -this.size * 0.18;
      circle(-ex, ey, eyeR);
      circle(+ex, ey, eyeR);

      // 3) beak
      fill('#FFCC66');
      let bw = this.size * 0.25, bh = this.size * 0.12;
      ellipse(0, this.size * 0.02, bw, bh);
      stroke('#E6B800');
      strokeWeight(2);
      line(-bw/2 + 4, this.size * 0.02, bw/2 - 4, this.size * 0.02);

      // 4) belly
      noStroke();
      fill('#FFFFFF');
      ellipse(0, this.size * 0.25, this.size * 0.4, this.size * 0.3);

      // 5) crown base and tips
      noStroke();
      fill('#FFD700');  // gold
      beginShape();
        vertex(-this.size*0.35, -this.size*0.45);
        vertex(-this.size*0.15, -this.size*0.75);
        vertex(0,               -this.size*0.45);
        vertex( this.size*0.15, -this.size*0.75);
        vertex( this.size*0.35, -this.size*0.45);
        vertex( this.size*0.35, -this.size*0.35);
        vertex(-this.size*0.35, -this.size*0.35);
      endShape(CLOSE);

      // 6) gems on each tip
      const gemColors = ['#FF0000', '#00FF00', '#0000FF']; // red, green, blue
      const gemXs     = [-this.size*0.15, 0, this.size*0.15];
      let gemY        = -this.size*0.75;
      for (let i = 0; i < 3; i++) {
        fill(gemColors[i]);
        circle(gemXs[i], gemY, this.size * 0.08);
      }

    pop();

    // prompt
    this.drawPrompt();
  }
}




function drawDialogueGUI(npc) {
  let guiW = width * 0.8;
  let guiH = height * 0.4;
  let guiX = (width - guiW) / 2;
  let guiY = (height - guiH) / 2;
  let arrowSize = 20;
  push();
    fill(230); stroke(0); rect(guiX, guiY, guiW, guiH);
    // Portrait box
    let portraitW = guiW * 0.3;
    let portraitH = guiH * 0.8;
    let portraitX = guiX + 10;
    let portraitY = guiY + 10;
    fill(255); stroke(0); rect(portraitX, portraitY, portraitW, portraitH);
    // Portrait character
    let portraitSize = portraitH * 0.5;
    push();
      let px = portraitX + portraitW/2;
      let py = portraitY + portraitH/2;
      translate(px, py);
      stroke(0); fill(npc.skinColor);
      circle(0, 0, portraitSize);
      fill(npc.eyeColor);
      let off = portraitSize * 0.2;
      circle(-off, -off, portraitSize/5);
      circle(off, -off, portraitSize/5);
    pop();


    // Name bar
    let nameH = 30;
    let nameY = portraitY + portraitH;
    fill(240); stroke(0);
    rect(portraitX, nameY, portraitW, nameH);
    noStroke(); fill(0);
    textAlign(CENTER, CENTER); textSize(16);
    text(npc.name, portraitX + portraitW/2, nameY + nameH/2);
    // Text area
    noStroke(); fill(0);
    textAlign(LEFT, TOP); textSize(16);
    let textX = portraitX + portraitW + 20;
    let textY = portraitY + 20;
    let textW = guiW - portraitW - 40;
    let textH = portraitH;
    let dialog = npc.dialogue[npc.dialogueIndex];
    text(dialog, textX, textY, textW, textH);
    // Arrows
    fill(0);
    if (npc.dialogueIndex > 0) {
      triangle(
        width/2 - 20, guiY + guiH - arrowSize*2 + arrowSize/2,
        width/2 - 20 + arrowSize, guiY + guiH - arrowSize*2,
        width/2 - 20 + arrowSize, guiY + guiH - arrowSize*2 + arrowSize
      );
    }
    if (npc.dialogueIndex < npc.dialogue.length - 1) {
      triangle(
        width/2 + 20, guiY + guiH - arrowSize*2,
        width/2 + 20, guiY + guiH - arrowSize*2 + arrowSize,
        width/2 + 20 + arrowSize, guiY + guiH - arrowSize*2 + arrowSize/2
      );
    }
    // Close X
    stroke(0); strokeWeight(2);
    let xSize = 20;
    let xX = guiX + guiW - xSize - 10;
    let xY = guiY + 10;
    line(xX, xY, xX + xSize, xY + xSize);
    line(xX + xSize, xY, xX, xY + xSize);
  pop();
}


function drawAlien(baseX, baseY, c, m) {
  // time parameter (seconds)
  let t = millis() / 1000;
  // oscillation offsets
  let dx = m*sin(t * 2.0) * 20;   // horizontal swing ±20px
  let dy = cos(t * m) * 10.4;   // vertical bounce ±10px

  push();
    translate(baseX + dx, baseY + dy);

    // body
    stroke(0);
    strokeWeight(1);
    fill(c);           // lime-green alien
    circle(0, 0, 40);

    // eyes
    fill(0);
    circle(-10, -5, 8);
    circle( 10, -5, 8);

    // smiling mouth
    noFill();
    line(-5,2,5,2)

    // antennas
    strokeWeight(2);
    // left antenna
    line(-12, -20, -20, -32);
    // right antenna
    line( 12, -20,  20, -32);
    // antenna tips
    fill('#FFFF00');
    noStroke();
    circle(-20, -32, 8);
    circle( 20, -32, 8);
  pop();
}

class BackgroundPlanet {
  constructor(x, y, size, color, speed) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.speed = speed;
  }

  update() {
    // drift right and wrap
    this.x = (this.x + this.speed) % 1000;
  }

  draw() {
    push();
      translate(this.x, this.y);
      noStroke();

      // draw main globe
      fill(this.color);
      circle(0, 0, this.size);

      // optional ring (just one example)
      noFill();
      stroke(255, 255, 255, 100);
      strokeWeight(this.size * 0.05);
      ellipse(0, 0, this.size * 1.2, this.size * 0.6);
    pop();
  }
}

// 1) Scanning Panel (thin horizontal module)
function drawTechnoBob1(x, y) {
  const w = 80, h = 20;
  push();
    translate(x, y);
    stroke(0); fill(255); 
    rect(0, 0, w, h, 4);

    // moving scan line
    let t = millis() / 1000;
    let scanY = map(sin(t * 3)/2, -1, 1, 0, h);
    noStroke(); fill(0, 255, 0, 200);
    rect(0, scanY, w, 4);
  pop();
}

// 2) Vent Radiator (tall vertical module)
function drawTechnoBob2(x, y) {
  const w = 20, h = 80;
  push();
    translate(x, y);
    stroke(0); fill(255);
    rect(0, 0, w, h, 4);

    // pulsing vents
    let t = millis() / 500;
    noStroke(); fill(100, 100, 255, 180);
    for (let i = 0; i < 8; i++) {
      let offset = (t * 10 + i * 10) % (h-10) +2;
      rect(2, offset, w - 4, 6, 2);
    }
  pop();
}

// 3) Rotating Gear (circular module)
function drawTechnoBob3(x, y) {
  const size = 80;
  let cx = x + size/2, cy = y + size/2;
  push();
    // container
    stroke(0); fill(255);
    circle(cx, cy, size);

    // rotating spokes
    let t = millis() / 1000;
    stroke(0); strokeWeight(2);
    for (let i = 0; i < 6; i++) {
      let a = t * 2 + i * TWO_PI/6;
      let x2 = cx + cos(a) * (size/3);
      let y2 = cy + sin(a) * (size/3);
      line(cx, cy, x2, y2);
      fill(200); noStroke();
      circle(x2, y2, 8);
      stroke(0);
    }
  pop();
}

// 4) Pulsing Hex Module
function drawTechnoBob4(x, y) {
  const size = 80;
  let cx = x + size/2, cy = y + size/2;
  let t = millis() / 500;
  let pulse = map(sin(t), -1, 1, 0.8, 1.2);
  push();
    translate(cx, cy);
    stroke(0); fill(255);
    polygon(0, 0, size/2, 6);        // container hexagon

    // inner pulsing hex
    scale(pulse);
    noStroke(); fill(255, 200, 0, 150);
    polygon(0, 0, size * 0.3, 6);
  pop();
}

// helper for drawing regular polygons at origin
function polygon(x, y, r, n) {
  beginShape();
  for (let i = 0; i < n; i++) {
    vertex(x + cos(TWO_PI * i / n) * r, y + sin(TWO_PI * i / n) * r);
  }
  endShape(CLOSE);
}

// 5) Oscillating Bar Graph (square module)
function drawTechnoBob5(x, y) {
  const w = 80, h = 80;
  push();
    translate(x, y);
    stroke(0); fill(255);
    rect(0, 0, w, h, 4);

    // animated bars
    let t = millis() / 700;
    const cols = 5;
    const bw = (w - 20) / cols;
    noStroke();
    for (let i = 0; i < cols; i++) {
      let ht = map(sin(t * 2 + i), -1, 1, h*0.2, h*0.8);
      fill(50 + i*40, 200 - i*30, 255 - i*20, 200);
      rect(6 + i*(bw + 2), h - ht - 5, bw, ht, 2);
    }
  pop();
}


function checkTech5() {
  const ans = accessInput.value().trim();
  if (ans === 'password') {
    // correct! open in new tab
    window.open('https://www.jigsawplanet.com/?rc=play&pid=265ac26d7359', '_blank');
  } else {
    accessError.html('Incorrect');
  }
}

function drawPortraitOfElenia(x, y) {
  push();
  fill('#DEDEDE');
  stroke(0); rect(x, y, 100, 120);
  fill('#000022');
  rect(x + 10, y + 10, 80, 80);
  fill('#00BFFF');
  circle(x + 50, y + 50, 10);
  noStroke(); fill(0);
  textAlign(CENTER);
  textSize(10);
  text("Portrait of Elenia", x + 50, y + 110);
  pop();
}

// Poem in a frame
function drawPoemPlaque(x, y) {
  push();
  fill('#DEDEDE');
  stroke(0); rect(x, y, 120, 140);
  fill(0);
  textAlign(CENTER);
  noStroke();
  textSize(10);
  text("O hear us sing,\nSing to the stars,\nSing to the planets,\nSing way out far,\n\nFor one day\nThe prophet will walk these halls", x+10, y + 65, 100);
  pop();
}

// Candle fixture with animation
function drawWallCandle(x, y) {
  push();
  // base platform
  fill('#552200');
  rect(x, y, 10, 20);
  rect(x + 2, y + 20, 6, 6);

  // flame animation
  let flicker = random(5, 10);
  fill(255, 200, 0);
  ellipse(x + 5, y - 5, flicker, flicker * 1.5);
  pop();
}

// Clamp player to lower half of screen in hallway
if (room === 1) {
  player.y = max(player.y, height / 2 + player.size / 2);
}


function drawSign(x, y, label) {
  push();
    // background plate
    fill('#DDDDDD');
    stroke(0);
    rect(x, y, 140, 30, 4);
    // arrow and text
    noStroke();
    fill(0);
    textFont('Comic Sans MS');
    textSize(16);
    textAlign(LEFT, CENTER);
    text(label + '  →', x + 10, y + 15);
  pop();
}


// Replace your old drawThroneCarpet() with this:

function drawThroneRug() {
  // rug dimensions
  const rugW   = 200;
  const startY = height/2 + 50;       // just below the throne base
  const rugH   = height - startY;
  const x      = width/2 - rugW/2;
  const step   = 40;                  // motif spacing

  push();
    // 1) Base crimson field
    

    noStroke();
    fill('#660000');
    rect(x, startY, rugW, rugH);

    // 2) Thick dark border
    stroke('#440000'); 
    strokeWeight(8);
    noFill();
    rect(x, startY, rugW, rugH);

    // 3) Gold embroidery — repeating diamond + zig-zag pattern
    stroke('#FFDD00');
    strokeWeight(2);

    for (let y = startY + step/2; y < height - step/2; y += step) {
      // — diamond motif centered
      beginShape();
        vertex(width/2,      y - step/4);
        vertex(width/2 + 20, y       );
        vertex(width/2,      y + step/4);
        vertex(width/2 - 20, y       );
      endShape(CLOSE);

      // — zig-zag side stripes
      beginShape();
        for (let i = 0; i <= rugW; i += 20) {
          let offset = (i/20 % 2 === 0) ? -10 : +10;
          vertex(x + i, y + offset);
        }
      endShape();
    }
  pop();
}

// Throne: animated glowing backrest and arms
function drawThrone(cx, cy) {
  const w = 200, h = 180;

  // pulsing glow
  let glow = map(sin(frameCount * 0.03), -1, 1, 0, 60);

  
  push();
    translate(cx, cy);

    // glow halo
    noStroke();
    fill(255, 200, 0, glow);
    ellipse(0, 0, w + 60, h + 100);

    // seat
    stroke(0);
    fill('#880000');
    rect(-w/2, 0, w, h/3, 10);

    // backrest
    fill('#AA0000');
    rect(-w/2, -h/2, w, h, 10);

    // arms
    fill('#770000');
    rect(-w/2 - 20, 0, 20, h/3, 5);
    rect(w/2, 0, 20, h/3, 5);
  pop();
  for (var i = 0; i < 20; i++){
      fill(i * 5+100, 0, 0)
      circle(cx,cy-i*2, (100 - i*5))
    }
    const candleOffsetX = 120;
  const candleOffsetY =  80;
  drawWallCandle(cx - candleOffsetX, cy + candleOffsetY);
  drawWallCandle(cx + candleOffsetX, cy + candleOffsetY);
  drawOrbitSymbols(cx, cy, 100);
}


// 1) Crescent moon
function drawCrescentMoon(x, y, r = 10, d = 40) {
  push();
  translate(x, y);
  rotate(millis() / 750);
  noStroke();
  fill(255, 255, 200);  // pale moon color
  
  beginShape();
  // Outer arc (from top to bottom)
  for (let theta = -HALF_PI; theta <= HALF_PI; theta += 0.02) {
    vertex(cos(theta) * r, sin(theta) * r);
  }
  // Inner arc, traced back (offset inward by d on the x-axis)
  for (let theta = HALF_PI; theta >= -HALF_PI; theta -= 0.02) {
    vertex(cos(theta) * (r - d) + d, sin(theta) * (r - d));
  }
  endShape(CLOSE);

  pop();
}

// 2) Five-pointed star
function drawStar(x, y, size) {
  let angle = TWO_PI / 5;
  let half = angle / 2.0;
  push();
    translate(x, y);
    noStroke();
    fill(255, 255, 200);
    rotate(millis() / 1000);
    beginShape();
    for (let a = -HALF_PI; a < TWO_PI - HALF_PI; a += angle) {
      let sx = cos(a) * size * 0.5;
      let sy = sin(a) * size * 0.5;
      vertex(sx, sy);
      sx = cos(a + half) * size * 0.2;
      sy = sin(a + half) * size * 0.2;
      vertex(sx, sy);
    }
    endShape(CLOSE);
  pop();
}

// 3) Simple squiggle
function drawSquiggle(x, y, size) {
  push();
    translate(x, y);
    noFill();
    stroke(255, 255, 200);
    strokeWeight(3);
    rotate(millis() / 1000);
    beginShape();
      for (let t = 0; t <= PI; t += 0.1) {
        let sx = cos(t * 5) * size * 0.4;
        let sy = map(t, 0, PI, -size * 0.5, size * 0.5);
        vertex(sx, sy);
      }
    endShape();
  pop();
}

function drawOrbitSymbols(cx, cy, radius) {
  let t = millis() / 1000;        // elapsed seconds
  let baseAngle = t * 0.5;        // controls angular speed
  const offsets = [0, TWO_PI/3, 4*PI/3];

  for (let i = 0; i < 3; i++) {
    let a = baseAngle + offsets[i];
    let sx = cx + cos(a) * radius;
    let sy = cy + sin(a) * radius;
    // choose which symbol
    if (i === 0) drawCrescentMoon(sx, sy, 30);
    if (i === 1) drawStar        (sx, sy, 30);
    if (i === 2) drawSquiggle    (sx, sy, 30);
  }
}

