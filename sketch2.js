// --- sketch2.js ---
// Minimal Park Scene with Dialogue

// --- Globals & Start Screen ---
let player;
let npcs = [];
let dialogueOpen = false;
let activeNPC = null;
let showStart = true;
let startButton;
let r3;
let sel;                                    // ← NEW: selection sound
let solvedTrees = [false, false, false, false];
let unlocked = false;
const treePasswords = ['15', '85', '4751097', '90'];

// Portal GUI state
let portalInput, portalSubmit, portalError;
let attemptsLeft = 3;
const portalX = 520, portalY = 250, portalRadius = 20;
const portalPassword = '101578961213971410121279';



// Tree-password GUI state
let treeInput, treeSubmit, treeError;
let currentTree = null;
// Positions of your four main trees (1–4, left→right)
const treePositions = [
  { x: 100, y: 450, size: 130 },  // Tree 1
  { x: 450, y: 180, size: 70  },  // Tree 2
  { x: 500, y: 420, size: 100 },  // Tree 3
  { x: 520, y: 200, size: 80  }   // Tree 4
];


function preload() {
  soundFormats('wav');
  r3 = loadSound('r3.wav');
  sel = loadSound('sel.wav');
}

function setup() {
  // Create and center canvas
  const cnv = createCanvas(600, 600).parent('sketch-container');
  cnv.style('display', 'block');
  cnv.style('margin', '0 auto');

  // Use Comic Sans and a smaller default text size
  textFont('Comic Sans MS');
  textSize(18);

  // Start button
  startButton = createButton('Start');
  startButton.style('font-family', 'Comic Sans MS');
  startButton.style('font-size', '16px');
  startButton.position(
    (windowWidth - width) / 2 + width/2 - 30,
    (windowHeight - height) / 2 + height/2 + 20
  );
  startButton.mousePressed(() => {
    showStart = false;
    r3.loop();
    startButton.hide();
  });

  // Initialize player and NPCs
  player = new Player(width/2, height * 0.75);
  // sitting under the big left‐hand tree at (100,450):
npcs.push(new NPC(
  'Corey',
  130, 440,
  [
    "eleni!!!",
    "good to see you!",
    "i was just waiting here for you to join me for our Lars and JP Licks date",
    "huh?? You're on a top secret mission to a secret realm with treasure?",
    "did you find it?",
    "...so then what brings you here? it seems like you have an important mission...",
    "the portal is here? oh is it that wierd device thingy over there between those three trees?",
    "yeah... i tried fiddling with that while i was waiting here but it looks like it needs some password",
    "the guy over there started yelling at me saying this is meant for the 'chosen one' who can solve the trial of the trees...",
    "like okay buddy, way to give away probably a bunch of information you weren't supposed to.",
    "oh speaking of...",
    "i didn't really pay it much attention, but i found this wierd note by this tree and i wonder if this is related to that or somehow related to some sort of part of your mission...",
    "check it out! maybe this is helpful to you. i'll be waiting here ready to head to JP licks when you're done.",
    "good luck!"
  ]
));

npcs.push(new NPC(
  'Emplyee',
  470, 260,
  [
    "hello, are you eleni?",
    "good.",
    "we've been expecting you.",
    "i'm merley here to make sure no wackos try fiddling with this device.",
    "i guess that makes me a security guard or something.",
    "i've already had to tell some random guy to scram. he tried tinkering with the teleporter.",
    "his name was definatley not 'eleni' but the look of your face tells me you're telling the truth.",
    "whenever you think you have the password to the teleporter, ill let you punch in a code.",
    "but three wrong attempts and i'm locking you out of the teleporter, capeesh?"
  ]
));
    // — Portal-password GUI —
  portalInput  = createInput().attribute('placeholder','Enter portal password');
  portalSubmit = createButton('Submit');
  portalError  = createP('').style('color','red');
  [portalInput, portalSubmit, portalError].forEach(el => el.hide());
  portalSubmit.mousePressed(() => {
    if (portalInput.value().trim() === portalPassword) {
      // correct
      sel.play()
      portalInput.hide(); portalSubmit.hide(); portalError.hide();
      unlocked = true;
      setTimeout(() => window.location.href='eleniarealm.html', 3000);
    } else {
      // wrong
      attemptsLeft--;
      if (attemptsLeft <= 0) {
        portalInput.hide(); portalSubmit.hide();
        portalError.html("").show();
        // change Employee’s dialogue to “you're not her.”
        const emp = npcs.find(n=>n.name==='Emplyee');
        if (emp) emp.dialogue = ["you're not her."];
      } else {
        portalError.html(`Incorrect (${attemptsLeft} left)`).show();
      }
    }
  });

  // --- Tree-password GUI (single input + submit) ---
  treeInput  = createInput().attribute('placeholder','Enter tree password');
  treeSubmit = createButton('Submit');
  treeError  = createP('').style('color','red');
  [treeInput, treeSubmit, treeError].forEach(el => el.hide());
  treeSubmit.mousePressed(() => {
  if (currentTree
  && treeInput.value().trim() === treePasswords[currentTree-1]) {
    sel.play()
    const n = currentTree;
    solvedTrees[n - 1] = true;              // ← mark solved
    [treeInput, treeSubmit, treeError].forEach(el => el.hide());
    currentTree = null;                     
    window.location.href = `tree_${n}.pdf`;
  } else {
    treeError.html('Incorrect').show();
  }
});



}

function draw() {
  clear();
  if (showStart) {
    // Pastel orange main screen
    background(255, 204, 153);
    textAlign(CENTER, CENTER);
    textSize(22);
    fill(0);
    text('Level 3\nLars Anderson Park, Brookline', width/2, height/2 - 20);
    return;
  }

  // --- Sky Gradient (pastel blue → orange) ---
  for (let y = 0; y < height/4; y++) {
    let t = y / (height/4);
    let c = lerpColor(color(135,206,250), color(255,200,150), t);
    stroke(c);
    line(0, y, width, y);
  }
  noStroke();
  push()
  fill('orange')
  circle(280,155,100)
  pop()
  drawBostonSkyline(300,150)
  // --- Rolling Hills ---
  fill(100, 200, 100);
  push()
  stroke(0,100,0);
  ellipse(width*0.3, height*0.71, 1000, 600);
  
  ellipse(width*0.7, height*0.7, 1200, 600);
  pop()

  drawFlowers(200, 200);
  drawBee(220, 180);

  // --- Player & NPCs ---
  drawGrassPatch(250, height * 0.78 - 100, 25);
drawGrassPatch(380, height * 0.76 + 15, 35);
drawGrassPatch(360, height * 0.76 - 205, 15);
drawGrassPatch(520, height * 0.80 + 5, 28);
  player.update();
  player.draw();

  drawPortal(520, 250, unlocked);
  
  // --- Trees ---
  treePositions.forEach((t,i) => {
    drawTree(t.x, t.y, t.size, i);
  });

  drawTree(50, 140, 20);
  drawTree(80, 135, 20);
  drawTree(80, 135, 20);
  drawTree(110, 134, 20);
  drawBush(150, 560,  60);
drawBush(100, 230,  30);
drawBush(500, 540,  70);
drawBush(400, 510,  55);
drawBush(20, 150,  10);
drawBush(39, 145,  6);

  for (let npc of npcs) npc.draw();

  // --- Dialogue Overlay ---
  if (dialogueOpen && activeNPC) {
    drawDialogueGUI(activeNPC);
  }
    // --- Tree Password Interaction ---
  if (!dialogueOpen) {
    let nearTree = false;
    for (let i = 0; i < treePositions.length; i++) {
      const t = treePositions[i];
      if (!solvedTrees[i] && dist(player.x, player.y, t.x, t.y) <= 10) {
        currentTree = i + 1;
        nearTree = true;
        break;
      }
    }
    if (nearTree) {
      // overlay + box
      push(); fill(0,150); rect(0,0,width,height); pop();
      fill(240); stroke(0);
      const w = 300, h = 150;
      rect(width/2 - w/2, height/2 - h/2, w, h, 10);
      noStroke(); fill(0);
      textAlign(CENTER, CENTER);
      textSize(16);
      text(`Tree ${currentTree} Password`, width/2, height/2 - 30);
      // show input & button
      treeInput.position(windowWidth/2 - 100, windowHeight/2).show();
      treeSubmit.position(windowWidth/2 +  20, windowHeight/2 + 25).show();
      treeError.position(windowWidth/2 - 100, windowHeight/2 + 30);
      if (treeError.html() !== '') treeError.show();
    } else {
      currentTree = null;
      [treeInput, treeSubmit, treeError].forEach(el => el.hide());
    }
  }
// — Portal Password Interaction —
if (!dialogueOpen && !unlocked && attemptsLeft > 0) {
  if (dist(player.x, player.y, portalX, portalY) <= portalRadius) {
    // dark overlay + box
    push(); fill(0,150); rect(0,0,width,height); pop();
    const guiW = 300, guiH = 150;
    const guiX = width/2 - guiW/2, guiY = height/2 - guiH/2;
    // panel
    push(); fill(240); stroke(0); rect(guiX,guiY,guiW,guiH,10); pop();
    // title
    noStroke(); fill(0);
    textAlign(CENTER); textSize(16);
    text('Portal Password', width/2, guiY + 25);
    // attempts counter top-right of panel
    textAlign(RIGHT, TOP); textSize(14);
    text(attemptsLeft, guiX + guiW - 10, guiY + 10);
    // show input/button/error
    portalInput.position(windowWidth/2 - 100, windowHeight/2).show();
    portalSubmit.position(windowWidth/2 + 20, windowHeight/2 + 25).show();
    portalError.position(windowWidth/2 - 100, windowHeight/2 + 30);
    if (portalError.html() !== '') portalError.show();
  } else {
    [portalInput, portalSubmit, portalError].forEach(el=>el.hide());
  }
}



drawGrassPatch(120, height * 0.75 + 20, 30);

}

// --- Player Class ---
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 30;
    this.speed = 2;
  }

  update() {
    let nx = this.x, ny = this.y;
    if (keyIsDown(87)) ny -= this.speed;
    if (keyIsDown(83)) ny += this.speed;
    if (keyIsDown(65)) nx -= this.speed;
    if (keyIsDown(68)) nx += this.speed;
    // Barrier: cannot walk into sky
    if (ny - this.size/2 < height/4) {
      ny = this.y;
    }
    this.x = nx;
    this.y = ny;
  }

  draw() {
    let angle = atan2(mouseY - this.y, mouseX - this.x);
    push();
      translate(this.x, this.y);
      rotate(angle + PI/2);
      stroke(0);
      fill('#E1C594');
      circle(0, 0, this.size);
      // eyes
      fill(255);
      let eo = this.size * 0.2;
      circle(-eo, -eo, this.size*0.2);
      circle( eo, -eo, this.size*0.2);
    pop();
  }
}

// --- NPC Class ---
class NPC {
  constructor(name, x, y, dialogue) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.size = 30;
    this.dialogue = dialogue;
    this.dialogueIndex = 0;
  }

  isNear() {
    return dist(this.x, this.y, player.x, player.y) < this.size + 10;
  }

  draw() {

    let angle = atan2(player.y - this.y, player.x - this.x);
    push();
      translate(this.x, this.y);
      // rotate *exactly* as Player does (so “up” matches)
      rotate(angle + PI/2);

      // body
      stroke(0);
      fill('#E1C594');
      circle(0, 0, this.size);

      // eyes
      fill(255);
      let eo = this.size * 0.2;
      circle(-eo, -eo, this.size * 0.2);
      circle( eo, -eo, this.size * 0.2);
    pop();


    if (this.isNear() && !dialogueOpen) {
      push();
        textFont('Comic Sans MS');
        textSize(14);
        fill(0);
        textAlign(CENTER);
        text("Press 'E' to interact", this.x, this.y - this.size);
      pop();
    }
  }
}

// --- Input & Dialogue ---
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
  let guiW = width*0.8, guiH = height*0.4;
  let guiX = (width-guiW)/2, guiY = (height-guiH)/2;
  let arrowSize = 20;
  // Next
  let nx = width/2+30, ny = guiY+guiH-arrowSize*2;
  if (mouseX>nx && mouseX<nx+arrowSize && mouseY>ny && mouseY<ny+arrowSize
      && activeNPC.dialogueIndex<activeNPC.dialogue.length-1) {
    activeNPC.dialogueIndex++;
    return;
  }
  // Prev
  let px = width/2-50, py = ny;
  if (mouseX>px && mouseX<px+arrowSize && mouseY>py && mouseY<py+arrowSize
      && activeNPC.dialogueIndex>0) {
    activeNPC.dialogueIndex--;
    return;
  }
  // Close X
let xSize = 20,
    xX = guiX + guiW - xSize - 10,
    xY = guiY + 10;
if (
  mouseX > xX && mouseX < xX + xSize &&
  mouseY > xY && mouseY < xY + xSize
) {
  // guard activeNPC before checking its name
  if (activeNPC && activeNPC.name === 'Corey') {
    window.open('another_strange_note.pdf');
  }
  dialogueOpen = false;
  activeNPC   = null;
}

}

function drawDialogueGUI(npc) {
  let guiW = width*0.8, guiH = height*0.4;
  let guiX = (width-guiW)/2, guiY = (height-guiH)/2;
  let arrowSize = 20;
  // backdrop
  push(); fill(0,150); rect(0,0,width,height); pop();
  // panel
  push(); fill(240); stroke(0); rect(guiX,guiY,guiW,guiH); pop();
    // Portrait frame
  let pW = guiW * 0.3, pH = guiH * 0.8;
  let pX = guiX + 10, pY = guiY + 10;
  push(); fill(255); stroke(0); rect(pX, pY, pW, pH); pop();


  push();
  translate(pX + pW/2, pY + pH/2);
  stroke(0); fill('#E1C594');
  circle(0, 0, pH * 0.5);
  fill(255);
  let eo = (pH * 0.5) * 0.2;
  stroke(0); circle(-eo, -eo, pH * 0.1);
  circle( eo, -eo, pH * 0.1);
  pop();


  // Name bar
  let nameH = 30;
  push(); fill(240); stroke(0);
    rect(pX, pY + pH, pW, nameH);
  pop();
  noStroke(); fill(0);
  textAlign(CENTER, CENTER);
  textSize(16);
  text(npc.name, pX + pW/2, pY + pH + nameH/2);

  push();
  noStroke();
  fill(0);
  textFont('Comic Sans MS');
  textSize(14);
  textAlign(LEFT, TOP);
  let textX = pX + pW + 20;
  let textY = pY + 20;
  let textW = guiW - pW - 40;
  text(npc.dialogue[npc.dialogueIndex], textX, textY, textW, pH);
  pop();
  // arrows
  push(); fill(0);
    if (npc.dialogueIndex>0) triangle(width/2-50, guiY+guiH-arrowSize*2+arrowSize/2,
                                      width/2-50+arrowSize, guiY+guiH-arrowSize*2,
                                      width/2-50+arrowSize, guiY+guiH-arrowSize*2+arrowSize);
    if (npc.dialogueIndex<npc.dialogue.length-1) triangle(width/2+30, guiY+guiH-arrowSize*2,
                                      width/2+30, guiY+guiH-arrowSize*2+arrowSize,
                                      width/2+30+arrowSize, guiY+guiH-arrowSize*2+arrowSize/2);
  pop();
  // close X
  push(); stroke(0); strokeWeight(2);
    let cx=guiX+guiW-30, cy=guiY+10;
    line(cx,cy,cx+20,cy+20);
    line(cx+20,cy,cx,cy+20);
  pop();
}

// --- Simple Tree Helper ---
function drawTree(x, y, s, idx) {
  push();
  translate(x, y);
  rectMode(CENTER);

  // trunk: taller (80% of s) so it's not hidden
  fill(101, 67, 33);
  rect(0, -s * 0.4, s * 0.2, s * 0.8);

  // foliage: smaller (60% of s) and lifted up
  const done = (idx !== undefined && solvedTrees[idx]);
  fill( done ? color(255,192,203) : color(34,139,34) );
  const foliageSize = s * 0.6;
  stroke(0,100,0)
  ellipse(0,  -s * 0.8, foliageSize, foliageSize);
  ellipse(-s * 0.25, -s * 0.6, foliageSize, foliageSize);
  ellipse( s * 0.25, -s * 0.6, foliageSize, foliageSize);

  pop();
}


function drawBostonSkyline(x, y) {
  push();
  translate(x, y);

  // widths (sum to 100) and heights for each “building”
  const bWidths  = [15, 20, 15, 20, 30];
  const bHeights = [50, 90,100, 80, 70];
  let xOffset = 0;

  for (let i = 0; i < bWidths.length; i++) {
    const bw = bWidths[i];
    const bh = bHeights[i];

    // main building body
    fill(50, 50, 70);
    rect(xOffset, -bh, bw, bh);

    // special cases
    if (i === 0) {
      // CITGO sign on building 0
      // draw red triangle above roof
      fill(200, 30, 30);
      const triTopY = -bh - 12;
      triangle(
        xOffset + bw/2, triTopY,
        xOffset + 2,      -bh + 2,
        xOffset + bw - 2, -bh + 2
      );
      // CITGO text
      fill(255);
      textSize(3);
      textAlign(CENTER, CENTER);
      text('CITGO', xOffset + bw/2, -bh);
    }

    if (i === 2) {
      // Prudential Center round top on building 2
      // draw semicircle roof
      fill(50, 50, 70);
      arc(
        xOffset + bw/2, // center x
        -bh,            // center y (at roof line)
        bw, bw,         // diameter
        PI, TWO_PI      // bottom half of circle
      );
    }

    // windows for all buildings
    fill(255, 240, 100);
    const cols = floor(bw / 6);
    const rows = floor(bh / 10);
    const winW = 4;
    const winH = 8;
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


function drawFlowers(x, y) {
  // center flower: pink petals, yellow center, size 20
  drawFlower(x,       y,    20, [255, 182, 193], [255, 215,   0]);
  // right flower: purple petals, light center, size 15
  drawFlower(x + 30,  y + 5, 15, [186,  85, 211], [255, 250, 205]);
  // upper-left flower: light green petals, orange center, size 18
  drawFlower(x - 20,  y - 15,18, [144, 238, 144], [255, 165,   0]);
}

// Draws one flower at (x, y) with overall size s.
// petalColor and centerColor are [r, g, b] arrays.
function drawFlower(x, y, s, petalColor, centerColor) {
  push();
  translate(x, y);

  // draw petals in a circle
  fill(petalColor[0], petalColor[1], petalColor[2]);
  const petalCount = 6;
  for (let i = 0; i < petalCount; i++) {
    ellipse(0, -s * 0.5, s * 0.3, s);
    rotate(TWO_PI / petalCount);
  }

  // draw center
  fill(centerColor[0], centerColor[1], centerColor[2]);
  ellipse(0, 0, s * 0.5, s * 0.5);

  pop();
}


function drawBee(x, y) {
  let t = millis() / 1000;
  // a more "random" trig pattern for flight
  let swayx = sin(t * 3.3 + cos(t * 1.5)) * 8;
  let swayy = cos(t * 2.1 + sin(t * 2.7)) * 4;

  push();
    translate(x + swayx, y + swayy);

    fill(0);
    triangle(-10, 0, 5, -3, 5, 3);
    // body
    fill(255, 204, 0);
    ellipse(0, 0, 14, 10);

    // stripes
    fill(0);
    rectMode(CENTER);
    rect(0, -2, 12, 1);
    rect(0,  2, 12, 1);

    // wings
    noStroke();
    fill(255, 255, 255, 150);
    ellipse(-4, -6, 8, 4);
    ellipse( 4, -6, 8, 4);

    // eyes
    fill(0);
    ellipse(-3, 0, 2, 2);
    ellipse( 3, 0, 2, 2);

    // stinger
    
  pop();
}

function drawPortal(x, y, active) {
  let t = millis() / 500;
  const w = 50, h = 50;
  
  push();
    translate(x, y);
    
    // Outer housing
    stroke(80);
    strokeWeight(4);
    rectMode(CENTER);
    fill(200);
    rect(0, 0, w, h, 8);
    
    // Control panel (bottom strip)
    noStroke();
    fill(50);
    rect(0, h * 0.3, w * 0.8, 10, 3);
    
    // Indicator lights on panel
    for (let i = -2; i <= 2; i++) {
      fill( active ? color(0, 200, 255) : color(60) );
      ellipse(i * 8, h * 0.3, 6, 6);
    }
    
    // Inner ring / portal window
    strokeWeight(3);
    if (active) {
      // pulsating cyan ring
      let r = map(sin(t * 3), -1, 1, 10, 16);
      stroke(0, 200, 255, 200);
      ellipse(0, -5, r * 2, r * 2);
    }
    // static ring outline
    stroke(0, 120, 180, active ? 255 : 100);
    ellipse(0, -5, 20, 20);
    
    // small tech details
    stroke(80);
    strokeWeight(1);
    line(-15, -h*0.2, -5, -h*0.2);
    line(15, -h*0.2, 5, -h*0.2);
    line(-h*0.2, 15, -h*0.2, 5);
    line(h*0.2, 15, h*0.2, 5);
  pop();
}

function drawBush(x, y, s) {
  push();
  translate(x, y);
  stroke(0,100,0);

  // foliage clusters
  fill(34, 139,  34);
  
  ellipse(0,         s * 0.2,         s,     s * 0.4);
  ellipse(-s * 0.4,  s * 0.1,   s * 0.7, s * 0.5);
  ellipse( s * 0.4,  s * 0.1,   s * 0.7, s * 0.5);
  ellipse(0,         0,         s,     s * 0.6);

  pop();
}


function drawGrassPatch(x, y, h) {
  push();
    translate(x, y);
    stroke(34, 139, 34);
    strokeWeight(2);
    // center blade
    push();
      rotate(radians(-5));
      line(0, 0, 0, -h);
    pop();
    // left blade
    push();
      rotate(radians(-15));
      line(-4, 0, -4, -h * 0.9);
    pop();
    // right blade
    push();
      rotate(radians(8));
      line(4, 0, 4, -h * 0.85);
    pop();
  pop();
}