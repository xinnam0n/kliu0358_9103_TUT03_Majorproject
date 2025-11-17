// utils.js
// Shared helper functions for the Wheels of Fortune sketch

// Randomly pick style for dot-heavy mode
function pickStyleDotHeavy() {
  return random() < 0.75 ? "dots" : "rays";
}

// Hover influence – modifies wheels' targetScale based on proximity to hoveredWheel
function updateHoverInfluence() {
  if (!hoveredWheel) {
    for (let w of wheels) {
      w.targetScale = 1; // no influence
    }
    return;
  }

  const maxDist = hoveredWheel.r * 3.0;

  for (let w of wheels) {
    const d = dist(w.x, w.y, hoveredWheel.x, hoveredWheel.y);

    if (d >= maxDist) {
      w.targetScale = 1; // back to normal
    } else {
      let t = 1 - d / maxDist;

      // smooth falloff (smoothstep)
      let eased = t * t * (3 - 2 * t);

      let base = 1.3 + 1 * eased;    // neighbour bump
      if (w === hoveredWheel) base += 0.01; // tiny extra for central wheel

      w.targetScale = base;
    }
  }
}

// Click shockwaves – modifies wheels' targetScale based on expanding rings
function updateShockwaves() {
  if (shockwaves.length === 0) return;

  const now = frameCount;

  // Remove finished shockwaves
  shockwaves = shockwaves.filter(sw => now - sw.startFrame < sw.duration);

  // For each wheel, compute extra scale from all active shockwaves
  for (let w of wheels) {
    let extra = 0;

    for (let sw of shockwaves) {
      const age = now - sw.startFrame;
      const t = age / sw.duration;          // 0..1 over lifetime
      const radius = sw.maxRadius * t;      // current wave radius

      const d = dist(w.x, w.y, sw.x, sw.y);
      const bandWidth = sw.maxRadius * 0.15;   // thickness of the ring
      const distToRing = abs(d - radius);

      if (distToRing < bandWidth) {
        const bandT = 1 - distToRing / bandWidth;   // 1 at centre of ring
        const ease = bandT * bandT * (3 - 2 * bandT); // smoothstep across band
        const fade = 1 - t;                          // fades out as wave ages
        const amp = 0.4;                             // overall strength

        extra += amp * ease * fade;
      }
    }

    // Apply shockwave effect multiplicatively on top of hover scaling
    if (extra > 0) {
      w.targetScale *= (1 + extra);
    }
  }
}

// Generate hex-packed wheel layout
function createWheels() {
  wheels = [];

  // Wheel size relative to screen
  let baseR = min(width, height) / 10;      // tweak for density
  let spacingX = baseR * 2;                 // hex packing
  let spacingY = baseR * sqrt(3);

  // Extend area beyond canvas to avoid gaps at edges when wheels are large
  let startX = -baseR;
  let startY = -baseR;
  let endX   = width  + baseR;
  let endY   = height + baseR;

  // number of columns and rows needed
  let cols = ceil((endX - startX) / spacingX) + 1;
  let rows = ceil((endY - startY) / spacingY) + 1;

  for (let j = 0; j < rows; j++) {
    // stagger every other row for hex layout
    let rowOffset = (j % 2 === 0) ? 0 : spacingX / 2;

    for (let i = 0; i < cols; i++) {
      let x = startX + i * spacingX + rowOffset;
      let y = startY + j * spacingY;

      // radius variation
      let r = baseR * random(0.75, 0.9);
      r = min(r, baseR);

      wheels.push(new Wheel(x, y, r, pickPalette()));
    }
  }
}

// Background color + particle field
function drawBackgroundTexture() {
  // Smoothly blend bgColor toward bgTargetColor:
  bgColor = lerpColor(bgColor, bgTargetColor, bgLerpSpeed);
  background(bgColor);
  noStroke();

  const boostActive = frameCount < particleBoostUntil;
  const speedMult = boostActive ? 8.0 : 1.0; // faster during boost

  for (let p of bgParticles) {
    // draw
    fill(p.c);
    ellipse(p.x, p.y, p.r, p.r);

    // move (with temporary speed multiplier)
    p.x += p.speedX * speedMult;
    p.y += p.speedY * speedMult;

    // slowly change direction (organic feel)
    p.speedX += random(-0.02, 0.02);
    p.speedY += random(-0.02, 0.02);
    p.speedX = constrain(p.speedX, -0.5, 0.5);
    p.speedY = constrain(p.speedY, -0.5, 0.5);

    // wrap around edges
    if (p.x < -10) p.x = width + 10;
    if (p.x > width + 10) p.x = -10;
    if (p.y < -10) p.y = height + 10;
    if (p.y > height + 10) p.y = -10;
  }
}
