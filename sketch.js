// const CIRCLE_SIZE = 30;
const WIDTH = 800;
const HEIGHT = 800;
let startTime;
let paused = true;
let pauseTime = 0;
let pauseStartTime;
let playTime; // curr - start - pauseTime;
let song;
let track = { approachRate: 3, notes: [], audio: "res/mayday/audio.mp3" };
let approachTime;
let activeNotes = [];
let shift = false;

function preload() {
  soundFormats("mp3", "ogg");
  song = loadSound(track.audio);
}

function setup() {
  createCanvas(WIDTH, HEIGHT);
  slider = createSlider(0, 1, 0.5, 0.01);
}

function start(data) {
  track = data;
  console.log(track);
  song.setVolume(slider.value());
  song.stop();
  song.play();
  startTime = new Date();
  pauseTime = 0;
  approachTime = Math.floor(3000 / track.approachRate + 300);
  paused = false;
}

function play() {
  pauseTime += pauseStartTime ? new Date() - pauseStartTime : 0;
  paused = false;
  song.play();
}

function pause() {
  pauseStartTime = new Date();
  paused = true;
  song.pause();
}

function keyPressed() {
  console.log(keyCode);
  if (keyCode === 32) {
    paused ? play() : pause();
  }
}

let circlex = 0;
let circley = 0;

const getDistance = (x1, y1, x2, y2) => {
  const a = Math.abs(x2 - x1);
  const b = Math.abs(y2 - y1);
  const c = Math.sqrt(a * a + b * b);
  return c;
};

function draw() {
  if (paused) return;
  playTime = new Date() - startTime - pauseTime;
  background(200);
  translate(WIDTH / 2, HEIGHT / 2);
  rotate(TWO_PI / 16);
  fill(255);
  polygon(0, 0, WIDTH / 2 - CIRCLE_SIZE, 8);
  fill(0);
  polygon(0, 0, WIDTH / 2 - CIRCLE_SIZE * 2, 8);
  rotate(-TWO_PI / 16);
  fill(35, 116, 171);
  ellipse(circlex, circley, CIRCLE_SIZE);
  fill(239, 35, 60);

  try {
    track.notes.map((note) => {
      if (playTime > note.time - approachTime && !note.played) {
        console.log("playtime:" + playTime);
        console.log("note.time:" + note.time);
        console.log("approachTime:" + approachTime);
        activeNotes.push(note);
        note.played = true;
        // console.log("note at " + note.time);
      }
    });
    if (activeNotes.length > 0) {
      activeNotes.map((note, index) => {
        // console.log(index); // There might be a problem here
        const life = (note.time - playTime) / approachTime; // (.52) percent of life the note has left;
        const distance =
          WIDTH / 2 -
          CIRCLE_SIZE * 2 -
          Math.floor((WIDTH / 2 - CIRCLE_SIZE * 2) * life); // where the note should be based on the timestamp
        note.xPos = distance * note.xPath;
        note.yPos = distance * note.yPath;
        ellipse(note.xPos, note.yPos, CIRCLE_SIZE);
        //collision check
        const d = getDistance(note.xPos, note.yPos, circlex, circley);
        if (d < CIRCLE_SIZE) {
          // circles are touching
          // console.log("hit");
        }
        //exit check
        if (
          Math.abs(note.xPos) > WIDTH / 2 ||
          Math.abs(note.yPos) > WIDTH / 2
        ) {
          activeNotes.shift();
        }
      });
    }
  } catch (e) {
    console.log(e);
    paush();
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
