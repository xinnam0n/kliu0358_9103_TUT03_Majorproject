### kliu0358_9103_TUT03_Majorproject

# Wheels of Fortune — Individual Component

## Introduction
This repository contains my individual contribution of our group’s interactive artwork inspired by Pacita Abad’s __“Wheels of Fortune”__. While the group collaboratively built the base system (wheel drawing, layout, textures), my contribution focuses on interactive behaviour, shockwave physics, background transitions, and a refined installation-like responsiveness based on the knowledge obtained from IDEA9103 throughout this semester.

## __“Wheels of Fortune”__ by Pacita Abad
Pacita Abad’s Wheels of Fortune (1994) is a textile-based trapunto painting characterised by layered circular forms, dense hand-stitched dots, vibrant colour contrasts, and a rhythmic, quilt-like surface. The work reflects Abad’s broader practice of combining painting, sewing, and embellishment to create textured, sculptural compositions that feel energetic and celebratory. 

![Wheels of Fortune by Pacita Abad, 2000.](https://d7hftxdivxxvm.cloudfront.net/?height=800&quality=50&resize_to=fit&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FRpcGV_JpGZ-w6wxDK5i5sQ%2Fnormalized.jpg&width=800)

---

## Inspirations

Although the artwork is static, its radiating rings and repeated dot patterns suggest movement, expansion, and vibration. These qualities informed my animation approach: translating Abad’s layered circles into breathing wheels, her stitched dots into dynamic point patterns, and her sense of rhythmic radiance into interactive ripples and colour shifts that bring the original visual language to life in motion.

<br><br>
<p align="center">
    <img src="https://d7hftxdivxxvm.cloudfront.net/?height=542&quality=80&resize_to=fit&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FPefwhQYZYVGa8ELzEcDVdA%2Flarge.jpg&width=445" alt="Rajasthan quartet by Pacita Abad, 2000." width="500">
</p>
<br><br>

Overall aesthetic: __Rajasthan quartet__ by Pacita Abad: [Links to an external site](https://www.artsy.net/artwork/pacita-abad-rajasthan-quartet)

<br><br>
<p align="center">
    <img src="https://media-icamiami-org.imgix.net/2019/09/9b064c67-yayoi-kusama-all-the-eternal-love-i-have-for-the-pumpkins-detail-2016.jpg?auto=compress,format&cs=srgb&w=3072&fit=max" alt="All the Eternal Love I Have for the Pumpkins by Yayoi Kusama, 2016." width="500">
</p>
<br><br>

Pattern alternation: __All the Eternal Love I Have for the Pumpkins__ by Yayoi Kusama: [Links to an external site](https://icamiami.org/exhibition/yayoi-kusama/)

<br><br>
<p align="center">
    <img src="https://www.lozano-hemmer.com/image_sets/climate_parliament/houston_2024/climate_parliament_houston_2024_fh_029.jpg" alt="Climate Parliament by ATELIER LOZANO-HEMMER, 2024." width="500">
</p>
<br><br>

Ripple effect: __Climate Parliament__ by ATELIER LOZANO-HEMMER: [Links to an external site](https://www.lozano-hemmer.com/climate_parliament.php)

---


## How to Interact

When you open the page in the browser:

### 🖱️ Hover

![Animated artwork](/readmeImages/1.gif)

- Slowly move your mouse across the canvas.
- Wheels gently expand when hovered
- Neighbouring wheels ripple outward in a smooth falloff
- The motion encourages scanning and grazing across the canvas, not clicking rapidly

---

### 🖱️ Click

![Animated artwork](/readmeImages/2.gif)

Click directly on any wheel to trigger:
- A shockwave ring that expands through the wheel field
- A temporary burst in background particle motion
- A transition in background colour
- A soft wooden "tap" sound

This combination produces a strong sense of tactile feedback, like tapping a textile artwork.

---

### ⌨️ Keyboard

![Animated artwork](/readmeImages/3.gif)

__Press A__ → toggle animation (freeze/unfreeze breathing + rotation)
__Press R__ → reset everything to the initial system state

- Wheel sizes
- Breathing phases
- Shockwaves
- Background colour
- Particle field


---


## Design Approach

Our group collaborated on the basic drawing, hexagonal arrangement, palettes, and initial interactions.
My individual focus was to bring the static wheels to life by adding dynamic, system-level animation layers based on:

- __User Input & Interaction__
- __Sound Effects__
- __Time__

I explored interaction-driven animation, using real-time user events to activate system behaviours.

### Animated elements (Unique Individual Contribution)

My individual animation contributions differ from my group members in the following ways:

1. Shockwave System (Click-Based Animation)

On click, I implemented a physically-inspired shockwave that:
- Propagates radially through the grid
- Calculates per-wheel distance-to-wavefront
- Applies a smoothstep-based scale bump
- Fades out with time

This gives the artwork a strong installation-like reaction rather than a simple UI click.

2. Background Particle Speed Bursts

I linked click events to a temporary speed multiplier for background particles.
The result is a “gust of wind” effect that complements the shockwave.

3. Background Colour Transition

Each click triggers a colour transition using ```lerpColor()```.
This turns the background into a living canvas that shifts mood over time.

4. Sound Feedback

Adding p5.sound, I designed subtle tactile feedback via a click sound—
chosen specifically to match Pacita Abad’s handcrafted, beadwork textures.

5. Reset System

Pressing R clears shockwaves, resets wheel sizes, colour transitions, and particles.
This provides a clean way to restart the system after chaotic play.

6. Breathing Animation Refinement

Each wheel has a gentle breathing motion.
I tuned the amplitude, frequency, and interpolation for a softer, more textile-like pulse.

7. Bubble-based On-Screen Instructions

I added a floating bubble label (“Hover: …”) with drop shadows to reinforce user affordances.

>All features above were implemented only in my individual version, so they clearly differ from animations focusing solely on color changes, delays, Perlin-driven movement, etc.

---

## Technical Exploration
### 1. Hover Ripple (__utils.js__ → ```updateHoverInfluence()```)

- Computes distance from mouse target
- Applies smoothstep-based easing for neighbour wheels
- Updates ```targetScale```

Lerp interpolation in ```Wheel.update()``` smooths movement

### 2. Shockwave Propagation (utils.js → ```updateShockwaves()```)

Each shockwave stores:
```{x, y, startFrame, duration, maxRadius}```

Every frame:
- Compute wave radius based on time
- Find each wheel’s distance to the ring
- If within ring thickness → apply ```amp * ease * fade```

### 3. Background Particle Boost

On click, I set:
```particleBoostUntil = frameCount + 40;```
Background particles switch to: 
```speedMult = boostActive ? 8.0 : 1.0;```

### 4. Background Colour Transitions

Every frame:
```bgColor = lerpColor(bgColor, bgTargetColor, bgLerpSpeed);```

Smooth cinematic fade, not an abrupt flash.

### 5. Sound (sketch.js → preload() and mousePressed())

Loaded via:
```clickSound = loadSound("assets/click.wav");```

Then played with slight pitch variation:

```
clickSound.rate(random(0.9, 1.1));
clickSound.play();
```

### 6. Reset Function

```resetAll()``` resets:
- Wheel states
- Particles
- Colours
- Shockwaves
- Hover state
- Breathing phase

7. Code Modularity

I split helper logic into __utils.js__, keeping:
- Layout
- Background
- Shockwaves
- Hover influence

separate from the main generative logic in __sketch.js__.

---


## Notes on External Tools, Techniques, and References

1. p5.js
p5.js: [p5.js](https://p5js.org/)

2. p5.sound (official library) — used for click feedback
p5.sound.js: [p5.sound.js](https://p5js.org/reference/#p5.sound)

3. Smoothstep easing
I used a smoothstep easing function ```(t*t*(3-2*t))``` to create soft, organic transitions in the hover and shockwave animations. Smoothstep is a common graphics technique originating from GLSL, used to make motion feel natural and handcrafted.
Smoothstep easing technique: [Smoothstep](https://thebookofshaders.com/glossary/?search=smoothstep)

Using distance + smoothstep to set targetScale for all wheels in __utils.js__:

```js
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
```

4. Box-shadow styling
Standard CSS UI method.
CSS Dropshadows: [CSS Dropshadows](https://www.w3schools.com/css/css3_shadows.asp)

5. Drop shadows in p5 using canvas drawingContext.shadowX/Y
p5 drawingContext: [p5 drawingContext](https://p5js.org/reference/p5/drawingContext/)

6. Hexagonal layout math
Àdapted from standard honeycomb tiling formula.

7. Colour transitions using ```lerpColor()```
Standard p5 feature, no external code.
p5 ```lerpColor()```: [p5 lerpColor()](https://p5js.org/reference/p5/lerpColor/)

8. User input
My animation is driven entirely by user interaction using standard p5.js input techniques:

Mouse Hover Detection: I track mouseX and mouseY to identify which wheel the user is pointing at. This controls proximity-based scaling where nearby wheels grow smoothly using a GLSL-inspired smoothstep easing curve.
Finding the hovered wheel in __sketch.js__ (using mouseX, mouseY and isMouseInside):

```js
// 1) find hovered wheel
hoveredWheel = null;
for (let w of wheels) {
  if (w.isMouseInside(mouseX, mouseY)) {
    hoveredWheel = w;
    break;
  }
}
```

Click Events (```mousePressed()```): Clicking on a wheel triggers multiple reactions—shockwaves, particle speed bursts, background colour changes, and sound. This multi-trigger interaction pattern is common in interactive graphics, where a single input updates several visual states.
Keyboard Controls (```keyPressed()```):
- A toggles animation (wheel breathing/rotation).
- R resets the entire scene to its initial configuration.
These keys act as lightweight mode switches, allowing users to control animation flow without UI buttons.
Audio Permission Handling: I use ```userStartAudio()``` inside ```mousePressed()``` to comply with browser sound-autoplay restrictions, ensuring that the click sound plays reliably after the first interaction.
All user-input handling follows standard p5.js practices and is integrated to make the artwork feel responsive and tactile while staying true to the rhythm and circular motion of Pacita Abad’s visual language.

>Any borrowed idea includes inline comments + source link where appropriate.
