p5.disableFriendlyErrors = true; // disables FES to boost performance
let SCREEN;
let HALF;
let PX;
let NOTE_SIZE;
let score = 0;
let combo = 0;
let maxCombo = 0;
let notesFinished = false;
let songEnded = false;
let endLoop = 0;
let paused = true;
let currTime; // song.currentTime() - DELAY
let songDuration;
let track = {
  approachRate: 3,
  notes: [],
  breaks: [],
  audio: `res/tracks/${TRACK_NAME}/audio.mp3`,
};
let approachTime;
let currBreak = false;
let breaksLeft = [];
let notes = [];
let activeNotes = [];
let notesToPlay = []; // array of timing points to play hit sound;
let numPlayedNotes;
let edgeLength;
let cornerLength;
let anchorPoints = [];
let landed;
let accuracy = 0; // numHits / numHits + numMisses * 2
let numHits = 0;
let numMisses = 0;
let numAttempts = 0;
let dateTime;

// sound files
let song,
  hitNormal,
  hitWhistle,
  hitFinish,
  hitClap,
  endingCredits,
  applause,
  wedidit,
  comboBreak;
// image files
let trackBg,
  endbg,
  hitsIcon,
  missesIcon,
  accuracyIcon,
  maxComboIcon,
  btnBack,
  btnContinue,
  btnRetry,
  rankS,
  rankA,
  rankB,
  rankC,
  rankD,
  text0,
  text1,
  text2,
  text3,
  text4,
  text5,
  text6,
  text7,
  text8,
  text9,
  textComma,
  textDot,
  sectionFail,
  sectionPass,
  rightArrow,
  star,
  warningSign;

function preload() {
  soundFormats("mp3", "ogg", "wav");
  song = loadSound(track.audio);
  myFont = loadFont("res/Inconsolata-Regular.ttf");
  hitNormal = loadSound("res/sounds/normal-hit.wav");
  hitWhistle = loadSound("res/sounds/normal-hitwhistle.wav");
  hitFinish = loadSound("res/sounds/normal-hitfinish.wav");
  hitClap = loadSound("res/sounds/normal-hitclap.wav");
  endingCredits = loadSound("res/sounds/credits.wav");
  applause = loadSound("res/sounds/applause.wav");
  wedidit = loadSound("res/sounds/wedidit.wav");
  comboBreak = loadSound("res/sounds/combobreakoriginal.wav");

  // images
  endbg = loadImage("res/images/endbg.jpg");
  hitsIcon = loadImage("res/images/hits.png");
  missesIcon = loadImage("res/images/misses.png");
  accuracyIcon = loadImage("res/images/accuracy.png");
  maxComboIcon = loadImage("res/images/ranking-maxcombo.png");
  rankS = loadImage("res/images/ranking-S.png");
  rankA = loadImage("res/images/ranking-A.png");
  rankB = loadImage("res/images/ranking-B.png");
  rankC = loadImage("res/images/ranking-C.png");
  rankD = loadImage("res/images/ranking-D.png");
  text0 = loadImage("res/images/score-0.png");
  text1 = loadImage("res/images/score-1.png");
  text2 = loadImage("res/images/score-2.png");
  text3 = loadImage("res/images/score-3.png");
  text4 = loadImage("res/images/score-4.png");
  text5 = loadImage("res/images/score-5.png");
  text6 = loadImage("res/images/score-6.png");
  text7 = loadImage("res/images/score-7.png");
  text8 = loadImage("res/images/score-8.png");
  text9 = loadImage("res/images/score-9.png");
  textComma = loadImage("res/images/score-comma.png");
  textDot = loadImage("res/images/score-dot.png");
  sectionFail = loadImage("res/images/section-fail.png");
  sectionPass = loadImage("res/images/section-pass.png");
  rightArrow = loadImage("res/images/right-arrow.png");
  star = loadImage("res/images/star.png");
  warningSign = loadImage("res/images/warning-sign.png");
}

function setup() {
  const width = windowWidth;
  const height = windowHeight;
  SCREEN = width >= height ? height : width;
  HALF = SCREEN / 2;
  PX = SCREEN / 800; // PX = 1 if SCREEN = 800, adjusts to screen size/resolution;
  NOTE_SIZE = 12 * PX;
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
  noCursor();
  textFont(myFont);
  textSize(24);

  btnBack = createImage("res/images/pause-back.png");
  btnContinue = createImage("res/images/pause-continue.png");
  btnRetry = createImage("res/images/pause-retry.png");

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
  PX = SCREEN / 800; // PX = 1 if SCREEN = 800, adjusts to screen size/resolution;
  NOTE_SIZE = 12 * PX;
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
  console.log("start");
  getAudioContext().resume();
  track = data;
  console.log(track);
  if (track.bgImage)
    trackBg = loadImage(`res/tracks/${TRACK_NAME}/` + track.bgImage);
  if (track.breaks) breaksLeft = track.breaks;
  notes = track.notes;
  const AR = track.approachRate;
  song.setVolume(0.5);
  song.stop();
  song.play();
  songDuration = song.duration() * 1000;
  song.onended(() => {
    if (!paused) songEnded = true;
  });
  approachTime = 1800 - (AR < 5 ? 120 * AR : 120 * 5 + 150 * (AR - 5));
  paused = false;
  numPlayedNotes = 0;
  numHits = 0;
  numMisses = 0;
  numAttempts++;
  // todo reset other variables too
}

function play() {
  song.play();
  paused = false;
  console.log("play");
}

function pause() {
  song.pause();
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
      // console.log("hitSound:" + hitSound);
      hitNormal.play();
      break;
  }
}

function adjustAccuracy() {
  accuracy = Math.floor((100 * numHits) / (numHits + numMisses * 2));
}

function hit(region) {
  numHits++;
  adjustAccuracy();
  score += 5000 + 93 * combo;
  combo++;
  if (combo > maxCombo) maxCombo = combo;
}

function miss() {
  numMisses++;
  adjustAccuracy();
  if (combo > 10) comboBreak.play();
  combo = 0;
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
  let slice;
  const up = keyIsDown(UP_ARROW) ? true : keyIsDown(87);
  const right = keyIsDown(RIGHT_ARROW) ? true : keyIsDown(68);
  const down = keyIsDown(DOWN_ARROW) ? true : keyIsDown(83);
  const left = keyIsDown(LEFT_ARROW) ? true : keyIsDown(65);
  // keys overide mouse
  if (up && right) {
    slice = 1;
  } else if (down && right) {
    slice = 3;
  } else if (left && down) {
    slice = 5;
  } else if (left && up) {
    slice = 7;
  } else if (up) {
    slice = 0;
  } else if (right) {
    slice = 2;
  } else if (down) {
    slice = 4;
  } else if (left) {
    slice = 6;
  } else {
    // mouse
    let shortestLength = SCREEN;
    anchorPoints.forEach((b, i) => {
      const d = dist(b.x, b.y, mouseX, mouseY);
      if (shortestLength > d) {
        shortestLength = d;
        slice = i;
      }
    });
  }

  return slice;
};

const slices = () => {
  let lastAngle = 0;
  for (let i = 0; i < 8; i++) {
    if (i === activeSlice()) {
      // fill(190, 183, 223);
      fill(SLICE_COLOR);
      if (currBreak) fill(0);
      strokeWeight(0);
      arc(
        0,
        0,
        edgeLength - NOTE_SIZE - 3 * PX,
        edgeLength - NOTE_SIZE - 3 * PX,
        lastAngle,
        lastAngle + radians(45)
      );
    } else {
      fill(0);
      strokeWeight(0);
      arc(
        0,
        0,
        edgeLength - NOTE_SIZE - 3 * PX,
        edgeLength - NOTE_SIZE - 3 * PX,
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
      fill(190, 183, 223); // white-purple
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
  arc(0, 0, radius, radius, angle, angle + radians(45));
};

const flashGetReady = (endTime) => {
  const time = endTime - approachTime;
  if (currTime > time - 500) {
    // do nothing
  } else if (currTime > time - 1000) {
    // show warning
    image(warningSign, HALF - 50 * PX, HALF - 50 * PX, 100 * PX, 100 * PX);
  } else if (currTime > time - 1500) {
    // do nothing
  } else if (currTime > time - 2000) {
    // show warning
    image(warningSign, HALF - 50 * PX, HALF - 50 * PX, 100 * PX, 100 * PX);
  } else if (currTime > time - 2500) {
    // do nothing
  } else if (currTime > time - 3000) {
    // show warning
    image(warningSign, HALF - 50 * PX, HALF - 50 * PX, 100 * PX, 100 * PX);
  }
};

function displayResults() {
  if (endLoop === 0) {
    cursor();
    dateTime = new Date();
    endingCredits.play();
    applause.play();
    applause.onended(() => wedidit.play());
    drawingContext.shadowBlur = 0;
  }
  endLoop++;
  background(0);
  image(endbg, 0, 0, SCREEN, SCREEN);
  if (accuracy == 100) {
    image(rankS, 80 * PX, 145 * PX, 280 * PX, 330 * PX);
  } else if (accuracy > 93) {
    image(rankA, 85 * PX, 145 * PX, 280 * PX, 330 * PX);
  } else if (accuracy > 83) {
    image(rankB, 95 * PX, 145 * PX, 280 * PX, 330 * PX);
  } else if (accuracy > 73) {
    image(rankC, 85 * PX, 145 * PX, 270 * PX, 330 * PX);
  } else {
    image(rankD, 85 * PX, 145 * PX, 270 * PX, 330 * PX);
  }
  image(hitsIcon, 450 * PX, 200 * PX, 60 * PX, 60 * PX);
  image(missesIcon, 450 * PX, 280 * PX, 60 * PX, 60 * PX);
  image(accuracyIcon, 450 * PX, 360 * PX, 60 * PX, 60 * PX);
  fill(255);
  // fill(241, 241, 241);
  fill(242, 242, 242);
  stroke(0);
  strokeWeight(3 * PX);
  textAlign(LEFT);
  textSize(40 * PX);
  text(track.title, 60 * PX, 85 * PX);
  textSize(12 * PX);
  text(dateTime.toString(), 60 * PX, 110 * PX);
  textAlign(RIGHT);
  textSize(56 * PX);
  text(nfc(numHits), 720 * PX, 247 * PX);
  text(nfc(numMisses), 720 * PX, 327 * PX);
  text(accuracy + "%", 720 * PX, 407 * PX);
  textAlign(CENTER);
  textSize(80 * PX);
  text(nfc(score), HALF, 545 * PX);
  textAlign(RIGHT);
  textSize(48 * PX);
  image(maxComboIcon, 200 * PX, 575 * PX, 200 * PX, 80 * PX);
  text(nfc(maxCombo), 530 * PX, 630 * PX);
  textSize(20 * PX);
  text("x" + nfc(numAttempts), 740 * PX, 780 * PX);
  textAlign(LEFT);
  const seconds = Math.floor((songDuration / 1000) % 60);
  const minutes = Math.floor(songDuration / 1000 / 60);
  text(minutes + ":" + seconds, 60 * PX, 780 * PX);
  const numStars = Math.floor(track.difficulty);
  //stars
  for (i = 0; i < numStars; i++) {
    image(star, 60 * PX + i * 30 * PX, 15 * PX, 30 * PX, 30 * PX);
  }
  image(
    star,
    60 * PX + numStars * 30 * PX,
    15 * PX,
    (track.difficulty - numStars) * 30 * PX,
    30 * PX,
    0,
    0,
    40 * PX,
    40 * PX,
    COVER,
    LEFT
  );
  textSize(20 * PX);
  textAlign(LEFT);
  text(track.difficulty, 95 * PX + numStars * 30 * PX, 37 * PX);
}

function draw() {
  if (notesFinished && songEnded) {
    clear();
    displayResults(p5);
  } else {
    currTime = Math.floor(song.currentTime() * 1000) - DELAY;
    background(0);
    if (trackBg) image(trackBg, 0, 0, SCREEN, SCREEN);
    // text
    let fps = frameRate();
    drawingContext.shadowBlur = 0;
    fill(255);
    stroke(0);
    strokeWeight(3 * PX);
    textAlign(LEFT);
    textSize(SCREEN / 15);
    text(nfc(combo), SCREEN / 80, SCREEN - SCREEN / 80);
    textSize(SCREEN / 28);
    text(nfc(accuracy) + "%", SCREEN / 80, SCREEN / 28);
    textAlign(RIGHT);
    textSize(SCREEN / 28);
    text(nfc(score), SCREEN - SCREEN / 80, SCREEN / 28);
    textSize(SCREEN / 66);
    text("FPS: " + fps.toFixed(2), SCREEN - SCREEN / 80, SCREEN - SCREEN / 80);
    // progress bar
    stroke(255, 0, 0);
    strokeWeight(8 * PX);
    x = map(currTime, 0, songDuration, 0, SCREEN);
    line(0, 0, x, 0);
    // PIE GLOW
    fill(255);
    strokeWeight(0);
    drawingContext.shadowColor = "white";
    drawingContext.shadowBlur = 50 * PX;
    ellipse(HALF, HALF, edgeLength + NOTE_SIZE);
    drawingContext.shadowBlur = 0;
    translate(HALF, HALF);
    rotate(radians(-90 - 45 / 2));
    // HIT ZONE
    noFill();
    strokeWeight(0);
    stroke(255);
    landingRegion();
    // pie slices
    strokeWeight(0);
    drawingContext.shadowBlur = 2 * PX;
    if (SHOW_SLICES) {
      drawingContext.shadowColor = "rgb(190, 183, 223)";
    } else {
      drawingContext.shadowColor = "rgb(0, 0, 0)";
    }
    slices();
    drawingContext.shadowBlur = 0;
    // NOTES
    noFill();
    strokeWeight(NOTE_SIZE * 2);
    stroke(NOTE_COLOR);
    drawingContext.shadowBlur = 50 * PX;
    drawingContext.shadowColor = NOTE_GLOW;
    // stroke(255, 0, 0);
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
        if (note.time < currTime) {
          playSound(note.sound);
          landed[note.path] = true; // turn green
          setTimeout(() => {
            landed[note.path] = false;
          }, 100);
          notesToPlay.shift();
        }
      }
      // breaks
      if (breaksLeft.length > 0) {
        const nextBreak = breaksLeft[0];
        if (currTime > nextBreak.startTime) {
          currBreak = true; // todo turn off active slice
          const halftime =
            nextBreak.startTime + nextBreak.endTime - nextBreak.startTime;
          if (currTime > halftime && currTime < halftime + 2000) {
            // todo add health mechanics
            // todo play section pass/fail sound
            // todo show section pass/fail icon
          }
          flashGetReady(nextBreak.endTime);
          if (currTime > nextBreak.endTime - approachTime) {
            breaksLeft.shift();
            currBreak = false;
          }
        }
      }
      // notes
      if (notes.length > 0) {
        const nextNote = notes[0];
        if (currTime > nextNote.time - approachTime) {
          numPlayedNotes++;
          activeNotes.push(nextNote);
          notes.shift();
        }
      }
      // activeNotes
      if (activeNotes.length > 0) {
        activeNotes.forEach((note, i) => {
          const life = (note.time - currTime) / approachTime; // (.52) percent of life the note has left;
          const radius = edgeLength - Math.floor(edgeLength * life); // where the note should be based on the timestamp
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
    drawingContext.shadowColor = "white";
    drawingContext.shadowBlur = 30 * PX;
    // MOUSE LINE
    strokeWeight(CURSOR_SIZE * PX);
    stroke(CURSOR_COLOR);
    line(mouseX, mouseY, pmouseX, pmouseY);
    // ANCHOR CIRCLE
    noStroke();
    strokeWeight(0);
    fill(255);
    ellipse(HALF, HALF, NOTE_SIZE);
  }
}
