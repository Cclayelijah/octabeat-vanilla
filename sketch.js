// const BUBBLE_SIZE = 30;
p5.disableFriendlyErrors = true; // disables FES to boost performance
let SCREEN;
let HALF;
let BUBBLE_SIZE = 30;
let score = 0;
let combo = 0;
let maxCombo = 0;
let startTime;
let notesFinished = false;
let songEnded = false;
let endLoop = 0;
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
let notesToPlay = []; // array of timing points to play hit sound;
let numPlayedNotes = 0;
let edgeLength;
let cornerLength;
let bubbles;

function preload() {
  soundFormats("mp3", "ogg", "wav");
  song = loadSound(track.audio);
  myFont = loadFont("res/Inconsolata-Regular.ttf");
  hitNormal = loadSound("res/sounds/low-tom.wav");
  hitWhistle = loadSound("res/sounds/low-tom.wav");
  hitFinish = loadSound("res/sounds/low-tom.wav");
  hitClap = loadSound("res/sounds/low-tom.wav");
  endingCredits = loadSound("res/sounds/credits.wav");
  wedidit = loadSound("res/sounds/wedidit.wav");
  cheer = loadSound("res/sounds/cheer.wav");
  missCrash = loadSound("res/sounds/break.wav");
}

function setup() {
  const width = windowWidth;
  const height = windowHeight;
  SCREEN = width >= height ? height : width;
  HALF = SCREEN / 2;
  BUBBLE_SIZE = SCREEN / 30;
  edgeLength = SCREEN / 2 - 75;
  cornerLength =
    Math.sqrt(edgeLength * edgeLength + edgeLength * edgeLength) / 2;

  createCanvas(SCREEN, SCREEN);
  textFont(myFont);
  textSize(24);

  bubbles = [
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

  bubbles = [
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
  }
}

function hit() {
  score += 100 + 3 * combo;
  combo++;
  if (combo > maxCombo) maxCombo = combo;
}

function miss() {
  if (combo > 10) missCrash.play();
  combo = 0;
  // console.log("miss");
}

function displayResults(p5) {
  if (endLoop === 0) {
    endingCredits.play();
    cheer.play();
    cheer.onended(() => wedidit.play());
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

const closestBubble = () => {
  let shortestLength = SCREEN;
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
    playTime = new Date() - startTime - timePaused;
    // line
    stroke(255, 0, 0);
    strokeWeight(10);
    x = map(playTime, 0, songDuration, 0, SCREEN);
    line(0, 0, x, 0);

    noStroke();
    strokeWeight(0);

    // collission bubbles - draw bubbles
    bubbles.map((b, i) => {
      if (paused) {
        fill(255);
      } else {
        if (i === closestBubble()) {
          b.active = true;
          // fill(143, 203, 155); // make it green
          fill(0, 255, 51);
        } else {
          b.active = false;
          // fill(255, 255, 200); // yellow
          fill(255);
        }
      }
      return ellipse(b.x, b.y, BUBBLE_SIZE);
    });

    fill(239, 35, 60);

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
          notesToPlay.shift();
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
          const distance = edgeLength - Math.floor(edgeLength * life); // where the note should be based on the timestamp
          note.xPos = distance * note.xPath + HALF;
          note.yPos = distance * note.yPath + HALF;
          ellipse(note.xPos, note.yPos, BUBBLE_SIZE);
          //collision check
          bubbles.forEach((b) => {
            const d = dist(note.xPos, note.yPos, b.x, b.y);
            if (d < BUBBLE_SIZE / 2 && !note.played && b.active) {
              notesToPlay.push({ time: note.time, sound: note.hitSound });
              hit();
              note.played = true;
              activeNotes.splice(i, 1);
            }
          });
          if (note.played) return;

          //exit check
          if (
            Math.abs(note.xPos) > SCREEN / 2 + HALF ||
            Math.abs(note.yPos) > SCREEN / 2 + HALF
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

    // BLUE ANCHOR CIRCLE
    fill(35, 116, 171);
    ellipse(HALF, HALF, BUBBLE_SIZE);
  }
}
