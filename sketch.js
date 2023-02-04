// const CIRCLE_SIZE = 30;
p5.disableFriendlyErrors = true; // disables FES to boost performance
const WIDTH = 800;
const HEIGHT = 800;
const center = p5.Vector(WIDTH / 2, HEIGHT / 2);
const HALF = WIDTH / 2;
let score = 0;
let combo = 0;
let maxCombo = 0;
let startTime;
let notesFinished = false;
let songEnded = false;
let paused = true;
let pauseTime = 0;
let pauseStartTime;
let playTime; // curr - start - pauseTime;
let song;
let songDuration;
let track = { approachRate: 3, notes: [], audio: "res/mayday/audio.mp3" };
let approachTime;
let notes = [];
let activeNotes = [];
let playedNotes = 0;
const edgeLength = WIDTH / 2 - CIRCLE_SIZE * 2.5 + 2;
const cornerLength =
  Math.sqrt(edgeLength * edgeLength + edgeLength * edgeLength) / 2;
let bubbles = [
  { x: HALF, y: HALF - edgeLength, active: false },
  { x: HALF + cornerLength, y: HALF - cornerLength, active: false },
  { x: HALF + edgeLength, y: HALF, active: false },
  { x: HALF + cornerLength, y: HALF + cornerLength, active: false },
  { x: HALF, y: HALF + edgeLength, active: false },
  { x: HALF - cornerLength, y: HALF + cornerLength, active: false },
  { x: HALF - edgeLength, y: HALF, active: false },
  { x: HALF - cornerLength, y: HALF - cornerLength, active: false },
];

function preload() {
  soundFormats("mp3", "ogg");
  song = loadSound(track.audio);
  myFont = loadFont("res/Inconsolata-Regular.ttf");
}

function setup() {
  createCanvas(WIDTH, HEIGHT);
  slider = createSlider(0, 1, 0.5, 0.01);
  textFont(myFont);
  textSize(24);
}

function start(data) {
  track = data;
  console.log(track);
  notes = track.notes;
  song.setVolume(slider.value());
  song.stop();
  song.play();
  songDuration = song.duration() * 1000;
  song.onended(() => {
    songEnded = true;
  });
  startTime = new Date();
  pauseTime = 0;
  approachTime = Math.floor(3000 / track.approachRate + 300);
  paused = false;
  console.log("start");
}

function play() {
  song.play();
  pauseTime += pauseStartTime ? new Date() - pauseStartTime : 0;
  paused = false;
  console.log("play");
}

function pause() {
  song.pause();
  pauseStartTime = new Date();
  paused = true;
  console.log("pause");
}

function hit() {
  score += 100 + 3 * combo;
  combo++;
  console.log("Score: " + score);
  console.log("Combo: " + combo);
}

function miss() {
  // play crash sound if combo > 25
  if (combo > maxCombo) maxCombo = combo;
  combo = 0;
  console.log("miss");
}

function complete() {
  console.log("stage complete");
}

function displayResults(p5) {
  background(0);
  textAlign(CENTER);
  textSize(56);
  text("Score: " + nfc(score), WIDTH / 2, HEIGHT / 2 - 100);
  textSize(48);
  text("Max Combo: " + nfc(maxCombo), WIDTH / 2, HEIGHT / 2);
}

function keyPressed() {
  // console.log(keyCode);
  if (keyCode === 32) {
    if (notesFinished) {
      songEnded = true;
      song.stop();
    } else paused ? play() : pause();
  }
  if (keyCode === 13) {
    if (notesFinished) {
      songEnded = true;
      song.stop();
    } else paused ? play() : pause();
  }
  if (keyCode === 27) {
    if (notesFinished) {
      songEnded = true;
      song.stop();
    } else paused ? play() : pause();
  }
}

const closestBubble = () => {
  let shortestLength = WIDTH;
  let shortestBubble;
  bubbles.forEach((b, i) => {
    const d = dist(b.x, b.y, mouseX, mouseY);
    if (shortestLength > d) {
      shortestLength = d;
      shortestBubble = i;
    }
  });
  return shortestBubble;
};

function draw() {
  if (notesFinished & songEnded) {
    clear();
    displayResults(p5);
  } else {
    if (paused) return;
    playTime = new Date() - startTime - pauseTime;
    noStroke();
    strokeWeight(0);
    background(0);
    // rotate(TWO_PI / 16);
    // translate(WIDTH / 2, HEIGHT / 2);
    // fill(255);
    // polygon(0, 0, WIDTH / 2 - CIRCLE_SIZE, 8);
    // fill(0);
    // polygon(0, 0, WIDTH / 2 - CIRCLE_SIZE * 2 - 2, 8);
    // translate(-WIDTH / 2, -HEIGHT / 2);
    // rotate(-TWO_PI / 16);

    // collission bubbles - draw bubbles
    bubbles.map((b, i) => {
      if (i === closestBubble()) {
        b.active = true;
        // fill(143, 203, 155); // make it green
        fill(0, 255, 51);
      } else {
        b.active = false;
        // fill(255, 255, 200); // yellow
        fill(255);
      }
      return ellipse(b.x, b.y, CIRCLE_SIZE);
    });

    fill(239, 35, 60);

    try {
      if (notes.length === 0 && activeNotes.length === 0) {
        notesFinished = true;
        return;
      }
      if (notes.length > 0) {
        let nextNote = notes[0];
        if (playTime > nextNote.time - approachTime) {
          playedNotes++;
          activeNotes.push(nextNote);
          notes.shift();
        }
      }
      // console.log(activeNotes);
      if (activeNotes.length > 0) {
        activeNotes.forEach((note) => {
          const life = (note.time - playTime) / approachTime; // (.52) percent of life the note has left;
          const distance = edgeLength - Math.floor(edgeLength * life); // where the note should be based on the timestamp
          note.xPos = distance * note.xPath + HALF;
          note.yPos = distance * note.yPath + HALF;
          ellipse(note.xPos, note.yPos, CIRCLE_SIZE);
          //collision check
          bubbles.forEach((b) => {
            const d = dist(note.xPos, note.yPos, b.x, b.y);
            if (d < CIRCLE_SIZE && !note.played && b.active) {
              hit();
              note.played = true;
            }
          });

          //exit check
          if (
            Math.abs(note.xPos) > WIDTH / 2 + HALF ||
            Math.abs(note.yPos) > WIDTH / 2 + HALF
          ) {
            activeNotes.shift();
            if (!note.played) {
              miss();
            }
          }
        });
      }
    } catch (e) {
      console.log(e);
      pause();
    }

    let fps = frameRate();
    fill(255);
    stroke(0);
    textAlign(LEFT);
    textSize(56);
    text(nfc(combo), 10, HEIGHT - 10);
    textAlign(RIGHT);
    textSize(28);
    text(nfc(score), WIDTH - 10, 28);
    textSize(12);
    text("FPS: " + fps.toFixed(2), WIDTH - 10, HEIGHT - 10);

    fill(35, 116, 171);
    ellipse(HALF, HALF, CIRCLE_SIZE);
    stroke(255, 0, 0);
    strokeWeight(10);
    x = map(playTime, 0, songDuration, 0, WIDTH);
    line(0, 0, x, 0);
    // let locX = mouseX - width / 2;
    // let locY = mouseY - height / 2;
    // ambientLight(60, 60, 60);
    // pointLight(35, 116, 171, locX, locY, 50);
    // specularMaterial(250);
    // shininess(0);
    // sphere(30);
  }
}

function polygon(x, y, radius, npoints) {
  let angle = TWO_PI / npoints;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius;
    let sy = y + sin(a) * radius;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}
