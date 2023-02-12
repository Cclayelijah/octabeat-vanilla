// const NOTE_SIZE = 30;
p5.disableFriendlyErrors = true; // disables FES to boost performance
let SCREEN;
let HALF;
let NOTE_SIZE;
const DELAY = 35;
let score = 0;
let combo = 0;
let notesPlayed;
let maxCombo = 0;
let startTime;
let notesFinished = false;
let songEnded = false;
let endLoop = 0;
let paused = true;
let pauseTime = 0;
let pauseStartTime;
let playTime; // currTime - startTime - pauseTime - DELAY;
let song;
let songDuration;
let track = {
  approachRate: 3,
  notes: [],
  audio: "res/tracks/marblesoda/audio.mp3",
};
let approachTime;
let notes = [];
let activeNotes = [];
let notesToPlay = []; // array of timing points to play hit sound;
let numPlayedNotes = 0;
let edgeLength;
let cornerLength;
let anchorPoints;
let landed;

function preload() {
  soundFormats("mp3", "ogg", "wav");
  song = loadSound(track.audio);
  myFont = loadFont("res/Inconsolata-Regular.ttf");
  hitNormal = loadSound("res/sounds/normal-hit.wav");
  hitWhistle = loadSound("res/sounds/normal-hitwhistle.wav");
  hitFinish = loadSound("res/sounds/normal-hitfinish.wav");
  hitClap = loadSound("res/sounds/normal-hitclap.wav");
  endingCredits = loadSound("res/sounds/credits.wav");
  wedidit = loadSound("res/sounds/wedidit.wav");
  applause = loadSound("res/sounds/applause.wav");
  comboBreak = loadSound("res/sounds/combobreakoriginal.wav");
}

function setup() {
  const width = windowWidth;
  const height = windowHeight;
  SCREEN = width >= height ? height : width;
  HALF = SCREEN / 2;
  NOTE_SIZE = SCREEN / 60;
  ellipseMode(RADIUS);
  edgeLength = SCREEN / 2 - 75;
  cornerLength =
    Math.sqrt(edgeLength * edgeLength + edgeLength * edgeLength) / 2;
  landed = [false, false, false, false, false, false, false, false];

  hitNormal.setVolume(0.5);
  hitWhistle.setVolume(0.5);
  hitFinish.setVolume(0.5);
  hitClap.setVolume(0.5);

  createCanvas(SCREEN, SCREEN);
  textFont(myFont);
  textSize(24);

  anchorPoints = [
    { x: HALF, y: HALF - edgeLength, active: false },
    { x: HALF + cornerLength, y: HALF - cornerLength, active: false },
    { x: HALF + edgeLength, y: HALF, active: false },
    { x: HALF + cornerLength, y: HALF + cornerLength, active: false },
    { x: HALF, y: HALF + edgeLength, active: false },
    { x: HALF - cornerLength, y: HALF + cornerLength, active: false },
    { x: HALF - edgeLength, y: HALF, active: false },
    { x: HALF - cornerLength, y: HALF - cornerLength, active: false },
  ];
}

function windowResized() {
  const width = windowWidth;
  const height = windowHeight;
  SCREEN = width >= height ? height : width;
  HALF = SCREEN / 2;
  edgeLength = SCREEN / 2 - 75;
  cornerLength =
    Math.sqrt(edgeLength * edgeLength + edgeLength * edgeLength) / 2;
  resizeCanvas(SCREEN, SCREEN);

  anchorPoints = [
    { x: HALF, y: HALF - edgeLength, active: false },
    { x: HALF + cornerLength, y: HALF - cornerLength, active: false },
    { x: HALF + edgeLength, y: HALF, active: false },
    { x: HALF + cornerLength, y: HALF + cornerLength, active: false },
    { x: HALF, y: HALF + edgeLength, active: false },
    { x: HALF - cornerLength, y: HALF + cornerLength, active: false },
    { x: HALF - edgeLength, y: HALF, active: false },
    { x: HALF - cornerLength, y: HALF - cornerLength, active: false },
  ];
}

function start(data) {
  track = data;
  console.log(track);
  notes = track.notes;
  song.setVolume(0.5);
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
  notesPlayed = 0;
}

function play() {
  song.play();
  pauseTime += pauseStartTime ? new Date() - pauseStartTime : 0; // total time paused
  paused = false;
  console.log("play");
}

function pause() {
  song.pause();
  pauseStartTime = new Date();
  paused = true;
  console.log("pause");
}

function playSound(hitSound) {
  switch (hitSound) {
    case 0:
      hitNormal.play();
      break;
    case 1:
      hitWhistle.play();
      break;
    case 2:
      hitFinish.play();
      break;
    case 3:
      hitClap.play();
      break;
    default:
      console.log("hitSound:" + hitSound);
      hitNormal.play();
      break;
  }
}

function hit(region) {
  score += 100 + 3 * combo;
  combo++;
  if (combo > maxCombo) maxCombo = combo;
}

function miss() {
  if (combo > 10) comboBreak.play();
  combo = 0;
}

function displayResults() {
  if (endLoop === 0) {
    endingCredits.play();
    applause.play();
    applause.onended(() => wedidit.play());
  }
  endLoop++;
  background(0);
  fill(255);
  stroke(0);
  textAlign(CENTER);
  textSize(56);
  text("Score: " + nfc(score), SCREEN / 2, SCREEN / 2 - 100);
  textSize(48);
  text("Max Combo: " + nfc(maxCombo), SCREEN / 2, SCREEN / 2);
  if (notesPlayed === maxCombo) {
    textSize(24);
    text("Full Combo!", SCREEN / 2, SCREEN / 2 + 50);
  }
}

function keyPressed() {
  // console.log(keyCode);
  if (keyCode === 32) {
    if (notesFinished) {
      console.log("stage complete");
      songEnded = true;
      song.stop();
    } else paused ? play() : pause();
    return false; // prevent scroll
  }
  if (keyCode === 13) {
    if (notesFinished) {
      console.log("stage complete");
      songEnded = true;
      song.stop();
    } else paused ? play() : pause();
  }
  if (keyCode === 27) {
    if (notesFinished) {
      console.log("stage complete");
      songEnded = true;
      song.stop();
    } else paused ? play() : pause();
  }
}

const activeSlice = () => {
  let shortestLength = SCREEN;
  let slice;
  anchorPoints.forEach((b, i) => {
    const d = dist(b.x, b.y, mouseX, mouseY);
    if (shortestLength > d) {
      shortestLength = d;
      slice = i;
    }
  });
  return slice;
};

const slices = () => {
  let lastAngle = 0;
  for (let i = 0; i < 8; i++) {
    if (i === activeSlice()) {
      fill(190, 183, 223);
      strokeWeight(0);
      arc(
        0,
        0,
        edgeLength - NOTE_SIZE - 3,
        edgeLength - NOTE_SIZE - 3,
        lastAngle,
        lastAngle + radians(45)
      );
    } else {
      fill(0);
      strokeWeight(0);
      arc(
        0,
        0,
        edgeLength - NOTE_SIZE - 3,
        edgeLength - NOTE_SIZE - 3,
        lastAngle,
        lastAngle + radians(45)
      );
    }
    lastAngle += radians(45);
  }
};

const landingRegion = () => {
  let lastAngle = 0;
  for (let i = 0; i < 8; i++) {
    if (landed[i]) {
      fill(0, 255, 51); // green
      arc(
        0,
        0,
        edgeLength + NOTE_SIZE,
        edgeLength + NOTE_SIZE,
        lastAngle,
        lastAngle + radians(45)
      );
    } else {
      fill(190, 183, 223); // purple
      arc(
        0,
        0,
        edgeLength + NOTE_SIZE,
        edgeLength + NOTE_SIZE,
        lastAngle,
        lastAngle + radians(45)
      );
    }
    erase();
    arc(
      0,
      0,
      edgeLength - NOTE_SIZE,
      edgeLength - NOTE_SIZE,
      lastAngle,
      lastAngle + radians(45)
    );
    noErase();
    lastAngle += radians(45);
  }
};

const barNote = (radius, notePath) => {
  const angle = radians(45 * notePath);
  // stroke(255);
  // if (notePath === activeSlice()) stroke(0);
  arc(0, 0, radius, radius, angle, angle + radians(45));
};

function draw() {
  if (notesFinished && songEnded) {
    clear();
    displayResults(p5);
  } else {
    background(0);
    // text
    let fps = frameRate();
    fill(255);
    stroke(0);
    textAlign(LEFT);
    textSize(SCREEN / 15);
    text(nfc(combo), SCREEN / 80, SCREEN - SCREEN / 80);
    textAlign(RIGHT);
    textSize(SCREEN / 28);
    text(nfc(score), SCREEN - SCREEN / 80, SCREEN / 28);
    textSize(SCREEN / 66);
    text("FPS: " + fps.toFixed(2), SCREEN - SCREEN / 80, SCREEN - SCREEN / 80);

    let timePaused = pauseTime;
    if (paused) {
      timePaused += new Date() - pauseStartTime;
    }
    playTime = new Date() - startTime - timePaused - DELAY;
    // progress bar
    stroke(255, 0, 0);
    strokeWeight(12);
    x = map(playTime, 0, songDuration, 0, SCREEN);
    line(0, 0, x, 0);

    translate(HALF, HALF);
    rotate(radians(-90 - 45 / 2));

    // HIT ZONE
    noFill();
    strokeWeight(4);
    stroke(255);
    landingRegion();

    // pie slices
    strokeWeight(0);
    slices();

    // NOTES
    noFill();
    strokeWeight(NOTE_SIZE * 2);
    stroke(255, 0, 0);
    try {
      if (
        notes.length === 0 &&
        activeNotes.length === 0 &&
        numPlayedNotes > 0
      ) {
        notesFinished = true;
        return;
      }
      // notesToPlay
      if (notesToPlay.length > 0) {
        let note = notesToPlay[0];
        if (note.time < playTime) {
          playSound(note.sound);
          landed[note.path] = true; // turn green
          setTimeout(() => {
            landed[note.path] = false;
          }, 100);
          notesToPlay.shift();
          notesPlayed++;
        }
      }
      // notes
      if (notes.length > 0) {
        let nextNote = notes[0];
        if (playTime > nextNote.time - approachTime) {
          numPlayedNotes++;
          activeNotes.push(nextNote);
          notes.shift();
        }
      }
      // activeNotes
      if (activeNotes.length > 0) {
        activeNotes.forEach((note, i) => {
          const life = (note.time - playTime) / approachTime; // (.52) percent of life the note has left;
          const radius = edgeLength - Math.floor(edgeLength * life); // where the note should be based on the timestamp
          // note.xPos = distance * note.xPath + HALF;
          // note.yPos = distance * note.yPath + HALF;
          // ellipse(note.xPos, note.yPos, NOTE_SIZE);
          barNote(radius, note.path);
          //collision check
          if (
            edgeLength - radius > -(NOTE_SIZE * 2) &&
            edgeLength - radius < NOTE_SIZE * 2 &&
            note.path === activeSlice() &&
            !note.played
          ) {
            // stroke of note is touching stroke of landing region
            notesToPlay.push({
              time: note.time,
              sound: note.hitSound,
              path: note.path,
            });
            hit(note.path);
            note.played = true;
            activeNotes.splice(i, 1);
          }
          if (note.played) return;

          //exit check
          if (radius > edgeLength + NOTE_SIZE * 4) {
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

    rotate(radians(90 + 45 / 2));
    translate(-HALF, -HALF);
    noStroke();
    strokeWeight(0);

    // ANCHOR CIRCLE
    fill(35, 116, 171); // blue
    fill(255);
    ellipse(HALF, HALF, NOTE_SIZE);
  }
}
