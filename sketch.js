// Pacita Abad – Wheels of Fortune inspired sketch
// by kliu0358
// sketch.js
// Main sketch file for Wheels of Fortune inspired artwork
// Uses p5.js library


// ------------------ GLOBALS ------------------ //

// Global variables
let wheels = [];
let animateWheels = true;
let shockwaves = [];

// Background colour animation
let bgColor;
let bgTargetColor;
let bgLerpSpeed = 0.02; // speed of background colour change

// Background particles
let bgParticles = [];
let NUM_PARTICLES = 2580;
let particleBoostUntil = 0;
let bgDotColors = [
  "#FFFFFF",
  "#C7EBFF",
  "#FFAEC0",
  "#FFCF70",
  "#9EE7C8",
  "#F48BFD",
  "#A7F0FF",
  "#FFC2DD"
];

// Hover / click state
let hoveredWheel = null;
let clickedWheel = null;

// Sound effects
let clickSound;


// ------------------ SETUP & DRAW ------------------ //

function preload() {
  soundFormats('wav', 'mp3', 'ogg');              // optional but good
  clickSound = loadSound('assets/click.wav', () => {
    console.log('clickSound loaded');
  }, (err) => {
    console.error('Error loading sound', err);
  });
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  colorMode(RGB, 255, 255, 255, 255);
  noStroke();

  // Initial background colour
  bgColor = color(4, 87, 131);        // current background color
  bgTargetColor = bgColor;            // target starts the same

  // Create background particles
  for (let i = 0; i < NUM_PARTICLES; i++) {
  bgParticles.push({
    x: random(width),
    y: random(height),
    r: random(3, 15),
    speedX: random(-0.4, 0.4),
    speedY: random(-0.4, 0.4),
    c: color(255, 255, 255, random(20, 120))
  });
}

  createWheels();
}

function draw() {
  drawBackgroundTexture();

  // 1) find hovered wheel
  hoveredWheel = null;
  for (let w of wheels) {
    if (w.isMouseInside(mouseX, mouseY)) {
      hoveredWheel = w;
      break;
    }
  }

  // 2) update hover influence for ALL wheels
  updateHoverInfluence();

  // 3) apply click shockwaves on top of hover
  updateShockwaves();

  // 4) draw
  for (let w of wheels) {
    if (animateWheels) w.update();
    w.display();
  }
}


function resetAll() {
  console.log("Resetting...");

  // Reset background color
  bgColor = color(4, 87, 131);
  bgTargetColor = bgColor;

  // Reset shockwaves
  shockwaves = [];

  // Reset particle speed boost
  particleBoostUntil = 0;

  // Reset clicked & hovered wheels
  clickedWheel = null;
  hoveredWheel = null;

  // Reset wheels (sizes, breathing phases, custom animations)
  for (let w of wheels) {
    w.currentScale = 1;
    w.targetScale = 1;
    w.hoverInfluence = 0;

    // Reset breathing animation
    w.pulsePhase = random(TWO_PI);
  }

  // Reset background particles positions & speeds
  for (let p of bgParticles) {
    p.x = random(width);
    p.y = random(height);
    p.speedX = random(-0.4, 0.4);
    p.speedY = random(-0.4, 0.4);
  }

  console.log("Reset complete.");
}



// ------------------ SETUP HELPERS ------------------ //

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createWheels();   // regenerate layout for new size
}

function updateHoverWheel() {
  hoveredWheel = null;
  for (let w of wheels) {
    if (w.isMouseInside(mouseX, mouseY)) {
      hoveredWheel = w;
      break; // first match is fine
    }
  }
}

function mousePressed() {
  // Ensure audio context is started (required on many browsers)
  userStartAudio();

  // Change background target colour randomly on click
  bgTargetColor = color(
    random(40, 255),
    random(40, 255),
    random(40, 255)
  );

  clickedWheel = null;
  for (let w of wheels) {
    if (w.isMouseInside(mouseX, mouseY)) {
      clickedWheel = w;

      // Create a shockwave at this wheel's position
      shockwaves.push({
        x: w.x,
        y: w.y,
        startFrame: frameCount,
        duration: 90,
        maxRadius: max(width, height) * 1.2
      });

      // Boost background particle speeds briefly
      particleBoostUntil = frameCount + 40;

      // Play click sound (safely)
      if (clickSound && clickSound.isLoaded()) {
        clickSound.stop();                          // avoid overlaps if you want
        clickSound.rate(random(0.9, 1.1));          // tiny pitch variation
        clickSound.setVolume(0.8);                  // just in case
        clickSound.play();
      } else {
        console.log('clickSound not ready yet');
      }

      break;
    }
  }
}



// ------------------ WHEEL CLASS ------------------ //

class Wheel {
  constructor(x, y, r, palette) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.palette = palette;

    // Breathing / pulsing effect parameters
    this.pulsePhase = random(TWO_PI);          // start at random phase
    this.pulseSpeed = random(0.1, 1);          // how fast it breathes
    this.pulseAmp = random(0.05, 0.15);        // % (range) size change
    this.hoverInfluence = 0;                   // how much hover affects size

    // Smooth scaling values for hover effect
    this.currentScale = 1;      // animated value
    this.targetScale  = 1;      // goal value set each frame
    this.scaleLerpSpeed = 0.15; // smoothing speed (0.1–0.2 looks good)

    // Pattern layers (random style per layer)
    this.layers = [
      {
        radius: this.r * 0.9,
        dotSize: this.r * random(0.1, 0.14),
        count: 30,
        angle: random(360),
        speed: random(0.4, 0.8),
        style: pickStyleDotHeavy(),   // random style
        dotColor: palette.dots1
      },
      {
        radius: this.r * 0.75,
        dotSize: this.r * 0.12,
        count: 20,
        angle: random(360),
        speed: random(-0.6, -0.3),
        style: pickStyleDotHeavy(),
        dotColor: palette.dots2
      },
      {
        radius: this.r * 0.55,
        dotSize: this.r * 0.10,
        count: 18,
        angle: random(360),
        speed: random(0.2, 0.5),
        style: pickStyleDotHeavy(),
        dotColor: palette.dots3
      }
    ];

    // Inner core pattern (can be solid / dots / rays)
    this.innerPattern = {
      radius: this.r * 0.35,
      dotSize: this.r * 0.08,
      count: 15,
      angle: random(360),
      speed: random(-0.7, 0.7),
      style: random(["solid", "dots", "rays"])
    };
  }


  update() {
    // rotate all pattern layers
    for (let layer of this.layers) {
      layer.angle += layer.speed;
    }

    // rotate inner pattern if it's not just a solid disc
    if (this.innerPattern.style !== "solid") {
      this.innerPattern.angle += this.innerPattern.speed;
    }

    // --- update breathing phase (NEW) ---
    this.pulsePhase += this.pulseSpeed;

    this.currentScale = lerp(this.currentScale, this.targetScale, this.scaleLerpSpeed);
  }


  display() {
    push();
    translate(this.x, this.y);
    
    // breathing
    let breathe = 1 + sin(this.pulsePhase) * this.pulseAmp;

    // smooth animated scaling
    let scaleFactor = breathe * this.currentScale;

    // add influence from hover (set in updateHoverInfluence)
    scaleFactor += this.hoverInfluence;

    // from here on, use scaleFactor to size everything:
    fill(this.palette.outer);
    ellipse(0, 0, this.r * 2 * scaleFactor);

    // if this is the hovered wheel, make it bigger
    if (this === hoveredWheel) {
      scaleFactor += 0.1;   // hover bump; tweak 0.2–0.5
    }

    // --- Outer disc ---
    fill(this.palette.outer);
    ellipse(0, 0, this.r * 2 * scaleFactor);

    // --- Big ring just under patterns ---
    fill(this.palette.ring1);
    ellipse(0, 0, this.r * 1.9 * scaleFactor);

    // --- Pattern layers (random dots/rays) ---
    this.drawPatternLayer(this.layers[0], scaleFactor);

    // Coloured ring between layer 1 and 2
    fill(this.palette.ring2);
    ellipse(0, 0, this.r * 1.55 * scaleFactor);

    // Ring 2 pattern
    this.drawPatternLayer(this.layers[1], scaleFactor);

    // Ring 3 pattern
    this.drawPatternLayer(this.layers[2], scaleFactor);

    // Inner coloured disc under core pattern
    fill(this.palette.ring3);
    ellipse(0, 0, this.r * 0.95 * scaleFactor);

    // --- Inner core (random style: solid/dots/rays) ---
    push();
    rotate(this.innerPattern.angle);

    if (this.innerPattern.style === "solid") {
      fill(this.palette.inner);
      ellipse(0, 0, this.r * 0.6 * scaleFactor);
    } else if (this.innerPattern.style === "dots") {
      this.drawDotRing(
        this.innerPattern.radius * scaleFactor,
        this.innerPattern.dotSize * scaleFactor,
        this.palette.dots3,
        this.innerPattern.count
      );
      fill(this.palette.inner);
      ellipse(0, 0, this.r * 0.5 * scaleFactor);
    } else if (this.innerPattern.style === "rays") {
      this.drawRays(
        this.innerPattern.radius * scaleFactor,
        this.palette.rays,
        this.innerPattern.count,
        scaleFactor
      );
      fill(this.palette.inner);
      ellipse(0, 0, this.r * 0.5 * scaleFactor);
    }

    // centre disc + tiny dot
    fill(this.palette.center);
    ellipse(0, 0, this.r * 0.32 * scaleFactor);
    fill(0);
    ellipse(0, 0, this.r * 0.12 * scaleFactor);

    pop(); // end innerPattern rotation

    // --- Tail / string ---
    this.drawTail(scaleFactor);

    pop();
  }


  isMouseInside(px, py) {
    const d = dist(px, py, this.x, this.y);
    return d < this.r; // within radius
  }

    
  drawPatternLayer(layer, scaleFactor) {
    push();
    rotate(layer.angle);

    if (layer.style === "dots") {
      this.drawDotRing(
        layer.radius * scaleFactor,
        layer.dotSize * scaleFactor,
        layer.dotColor,
        layer.count
      );
    } else if (layer.style === "rays") {
      this.drawRays(
        layer.radius * scaleFactor,
        this.palette.rays,
        layer.count,
        scaleFactor
      );
    }

    pop();
  }

  // Draw a ring of dots
  drawDotRing(radius, dotSize, col, count) {
    fill(col);
    noStroke();
    for (let i = 0; i < count; i++) {
      let a = (360 / count) * i;
      let x = cos(a) * radius;
      let y = sin(a) * radius;
      ellipse(x, y, dotSize, dotSize);
    }
  }

  // Draw rays pattern
  drawRays(radius, col, count, scaleFactor = 1) {
    stroke(col);
    strokeWeight(this.r * 0.05 * scaleFactor);
    noFill();
    for (let i = 0; i < count; i++) {
      let a = (360 / count) * i;
      let x1 = cos(a) * (radius * 0.4);
      let y1 = sin(a) * (radius * 0.4);
      let x2 = cos(a) * radius;
      let y2 = sin(a) * radius;
      line(x1, y1, x2, y2);
    }
    noStroke();
  }

  // Draw tail / string
  drawTail(scaleFactor = 1) {
    push();
    stroke(this.palette.tail);
    strokeWeight(this.r * 0.08 * scaleFactor);
    noFill();

    let base = this.r * scaleFactor;

    let start = createVector(0, 0);
    let ctrl = createVector(base * 0.7, -base * 0.5);
    let end  = createVector(base * 1.2, -base * 0.1);

    beginShape();
    vertex(start.x, start.y);
    quadraticVertex(ctrl.x, ctrl.y, end.x, end.y);
    endShape();

    noStroke();
    pop();
  }

}



// ------------------ COLOUR PALETTES ------------------ //

function pickPalette() {
  let options = [
    {
  outer:  "#FFFFFF",
  ring1:  "#FF7EB6",
  ring2:  "#FF96BF",
  ring3:  "#FFB7D4",
  dots1:  "#E83432",
  dots2:  "#FFFFFF",
  dots3:  "#FF7AAE",
  rays:   "#FF4C8B",
  inner:  "#E92D72",
  center: "#000000",
  tail:   "#FF4F9D"
},
{
  outer:  "#FF9A00",
  ring1:  "#FFAF37",
  ring2:  "#FFC260",
  ring3:  "#FFDD9E",
  dots1:  "#E83432",
  dots2:  "#FF81B9",
  dots3:  "#FF507C",
  rays:   "#E83432",
  inner:  "#FF4D84",
  center: "#000000",
  tail:   "#FF4F9D"
},
{
  outer:  "#FEC850",
  ring1:  "#F7A6D8",
  ring2:  "#E86AB8",
  ring3:  "#B857B0",
  dots1:  "#B52A8B", 
  dots2:  "#F5B3D9",
  dots3:  "#F43EA1",
  rays:   "#B52A8B",
  inner:  "#FF66C4",
  center: "#000000",
  tail:   "#FF3D72"
},
{
  outer:  "#FFFFFF",
  ring1:  "#C77ADD",
  ring2:  "#A75BC7",
  ring3:  "#7E4AA8",
  dots1:  "#E83432",
  dots2:  "#FFFFFF",
  dots3:  "#D47BE0",
  rays:   "#E83432",
  inner:  "#6AEB76",
  center: "#000000",
  tail:   "#FF4FA7"
},
{
  outer:  "#FFFFFF",
  ring1:  "#91EA7C",
  ring2:  "#C2FAB8",
  ring3:  "#F47FC2",
  dots1:  "#2E9F37", 
  dots2:  "#C3F9C4",
  dots3:  "#F85AA4",
  rays:   "#2E9F37",
  inner:  "#FF5AAD",
  center: "#000000",
  tail:   "#FF4FA0"
},
{
  outer:  "#FDBA3B",
  ring1:  "#FFDD85",
  ring2:  "#FFEEC0",
  ring3:  "#F79F2D",
  dots1:  "#1B3C88",
  dots2:  "#FFFFFF",
  dots3:  "#C682CA",
  rays:   "#1B3C88",
  inner:  "#E93D67",
  center: "#000000",
  tail:   "#FF4F9C"
},
{
  outer:  "#FDC54C",
  ring1:  "#F275BD",
  ring2:  "#C964C5",
  ring3:  "#66A4C0",
  dots1:  "#C76A00",  
  dots2:  "#FDC54C",
  dots3:  "#EF75D1",
  rays:   "#C76A00",
  inner:  "#9ECCE0",
  center: "#000000",
  tail:   "#FF4F9D"
},
{
  outer:  "#FFFFFF",
  ring1:  "#F38DBF",
  ring2:  "#F05C8E",
  ring3:  "#D64A72",
  dots1:  "#E83432",
  dots2:  "#FFFFFF",
  dots3:  "#ED5393",
  rays:   "#E83432",
  inner:  "#6EB66A",
  center: "#000000",
  tail:   "#FF4FA0"
},
{
  outer:  "#234BA0",
  ring1:  "#7ACD8A",
  ring2:  "#ED5AAA",
  ring3:  "#D96A98",
  dots1:  "#0D2C75",
  dots2:  "#1F46A3",
  dots3:  "#B05CCD",
  rays:   "#0D2C75",
  inner:  "#E63C45",
  center: "#000000",
  tail:   "#FF4FA0"
},
{
  outer:  "#EFB23A",
  ring1:  "#F47FBB",
  ring2:  "#6B75A0",
  ring3:  "#363939",
  dots1:  "#26488F",
  dots2:  "#FCEDC6",
  dots3:  "#ED5B5E",
  rays:   "#26488F",
  inner:  "#F4343D",
  center: "#000000",
  tail:   "#FF4FA7"
}

  ];

  return random(options);
}


// ------------------ INPUT ------------------ //

function keyPressed() {
  if (key === 'a' || key === 'A') {
    animateWheels = !animateWheels;
  }

  if (key === 'r' || key === 'R') {
    resetAll();
  }
}
