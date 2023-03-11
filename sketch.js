p5.disableFriendlyErrors = true; // disables FES to boost performance
let WIDTH;
let HEIGHT;
let SIZE;
let HALF;
let PX;
let NOTE_SIZE;
let screen;
let mobile = 0;
let posX, posY;
let fs = false;
let score = 0;
let combo = 0;
let maxCombo = 0;
let notesFinished = false;
let songEnded = false;
let paused = false;
let currBreak = false;
let numPlayedNotes = 0;
let accuracy = 0; // numHits / numHits + numMisses * 2
let numHits = 0;
let numMisses = 0;
let numAttempts = 1;
let currTime; // song.currentTime() - DELAY
let songDuration;
let track = {
  approachRate: 3,
  notes: [],
  breaks: [],
  audio: `res/tracks/${TRACK_NAME}/audio.mp3`,
};
let approachTime;
let breakData;
let breaksLeft = [];
let noteData;
let notes = [];
let activeNotes = [];
let notesToPlay = []; // array of timing points to play hit sound;
let edgeLength;
let cornerLength;
let anchorPoints = [];
let particles = [];
let landed;
let dateTime;
let fft;

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
let opad,
  trackBg,
  defaultBg,
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
  myFont = loadFont("res/Inconsolata-Regular.ttf");
  // sound
  soundFormats("mp3", "ogg", "wav");
  song = loadSound(track.audio);
  hitNormal = loadSound("res/sounds/normal-hit.wav");
  hitWhistle = loadSound("res/sounds/normal-hitwhistle.wav");
  hitFinish = loadSound("res/sounds/normal-hitfinish.wav");
  hitClap = loadSound("res/sounds/normal-hitclap.wav");
  endingCredits = loadSound("res/sounds/credits.wav");
  applause = loadSound("res/sounds/applause.wav");
  wedidit = loadSound("res/sounds/wedidit.wav");
  comboBreak = loadSound("res/sounds/combobreakoriginal.wav");
  // dom
  // btnBack = createImg("res/images/pause-back.png");
  // btnContinue = createImg("res/images/pause-continue.png");
  btnRetry = createImg("res/images/pause-retry.png");
  opad = createImg("res/images/opad.png");
  // images
  endbg = loadImage("res/images/space.jpg");
  trackBg = loadImage("res/images/retro-city.jpg");
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
  WIDTH = windowWidth;
  HEIGHT = windowHeight;
  SIZE = WIDTH >= HEIGHT ? HEIGHT : WIDTH;
  HALF = SIZE / 2;
  PX = SIZE / 800; // PX = 1 if SIZE = 800, adjusts to screen size/resolution;
  NOTE_SIZE = 12 * PX;
  ellipseMode(RADIUS);
  edgeLength = SIZE / 2 - 75 * PX;
  cornerLength =
    Math.sqrt(edgeLength * edgeLength + edgeLength * edgeLength) / 2;
  landed = [false, false, false, false, false, false, false, false];
  if (HEIGHT > WIDTH) {
    mobile = 1;
    if (HEIGHT > WIDTH * 1.5) mobile = 2;
    opad.show();
  } else {
    mobile = 0;
    opad.hide();
  }

  if (ANALYZE_AUDIO) {
    fft = new p5.FFT();
    fft.setInput(song);
  }
  hitNormal.setVolume(0.5);
  hitWhistle.setVolume(0.5);
  hitFinish.setVolume(0.5);
  hitClap.setVolume(0.5);
  song.setVolume(0.5);

  createCanvas(WIDTH, mobile ? SIZE : HEIGHT);
  noCursor();
  textFont(myFont);
  textSize(24);

  anchorPoints = [
    { x: WIDTH / 2, y: HALF - edgeLength, active: false },
    { x: WIDTH / 2 + cornerLength, y: HALF - cornerLength, active: false },
    { x: WIDTH / 2 + edgeLength, y: HALF, active: false },
    { x: WIDTH / 2 + cornerLength, y: HALF + cornerLength, active: false },
    { x: WIDTH / 2, y: HALF + edgeLength, active: false },
    { x: WIDTH / 2 - cornerLength, y: HALF + cornerLength, active: false },
    { x: WIDTH / 2 - edgeLength, y: HALF, active: false },
    { x: WIDTH / 2 - cornerLength, y: HALF - cornerLength, active: false },
  ];

  btnRetry.size(200 * PX, 65 * PX);
  btnRetry.position(WIDTH / 2 - 100 * PX, SIZE - 100 * PX);
  btnRetry.hide();
  if (mobile == 2) opad.size(400 * PX, 400 * PX);
  if (mobile == 1) opad.size(200, 200);
  if (mobile == 2) opad.position(WIDTH - 600 * PX, HEIGHT - 450 * PX);
  if (mobile == 1) {
    opad.position(WIDTH - 220, HEIGHT - 220);
  }
}

function windowResized() {
  WIDTH = windowWidth;
  HEIGHT = windowHeight;
  SIZE = WIDTH >= HEIGHT ? HEIGHT : WIDTH;
  HALF = SIZE / 2;
  PX = SIZE / 800; // PX = 1 if SIZE = 800, adjusts to screen size/resolution;
  NOTE_SIZE = 12 * PX;
  edgeLength = SIZE / 2 - 75;
  cornerLength =
    Math.sqrt(edgeLength * edgeLength + edgeLength * edgeLength) / 2;
  resizeCanvas(WIDTH, mobile ? SIZE : HEIGHT);
  if (HEIGHT > WIDTH) {
    mobile = 1;
    if (HEIGHT > WIDTH * 1.5) mobile = 2;
    opad.show();
  } else {
    mobile = 0;
    opad.hide();
  }

  anchorPoints = [
    { x: WIDTH / 2, y: HALF - edgeLength, active: false },
    { x: WIDTH / 2 + cornerLength, y: HALF - cornerLength, active: false },
    { x: WIDTH / 2 + edgeLength, y: HALF, active: false },
    { x: WIDTH / 2 + cornerLength, y: HALF + cornerLength, active: false },
    { x: WIDTH / 2, y: HALF + edgeLength, active: false },
    { x: WIDTH / 2 - cornerLength, y: HALF + cornerLength, active: false },
    { x: WIDTH / 2 - edgeLength, y: HALF, active: false },
    { x: WIDTH / 2 - cornerLength, y: HALF - cornerLength, active: false },
  ];

  btnRetry.size(200 * PX, 65 * PX);
  btnRetry.position(WIDTH / 2 - 100 * PX, SIZE - 100 * PX);
  if (mobile == 2) opad.size(400 * PX, 400 * PX);
  if (mobile == 1) opad.size(200, 200);
  if (mobile == 2) opad.position(WIDTH - 600 * PX, HEIGHT - 450 * PX);
  if (mobile == 1) opad.position(WIDTH - 220, HEIGHT - 220);
}

function start(data) {
  console.log("start");
  getAudioContext().resume();
  track = data;
  console.log(track);
  let img = new Image();
  img.src = `res/tracks/${TRACK_NAME}/` + track.bgImage;
  if (img.height != 0)
    trackBg = loadImage(
      `res/tracks/${TRACK_NAME}/` + track.bgImage,
      () => {
        console.log("loaded");
      },
      () => {
        console.log("failed to load image");
        trackBg = loadImage("res/images/retro-city.jpg");
      }
    );
  noteData = JSON.stringify(track.notes);
  breakData = JSON.stringify(track.breaks);
  notes = JSON.parse(noteData);
  breaksLeft = JSON.parse(breakData);
  const AR = track.approachRate;
  approachTime = 1800 - (AR < 5 ? 120 * AR : 120 * 5 + 150 * (AR - 5));
  song.stop();
  songDuration = song.duration() * 1000;
  song.onended(() => {
    if (!paused) songEnded = true;
  });
  setTimeout(() => {
    song.play();
  }, 3000);
}

function retry() {
  noCursor();
  btnRetry.hide();
  numAttempts++;
  notes = JSON.parse(noteData);
  breaksLeft = JSON.parse(breakData);
  console.log(track);
  notesToPlay = [];
  activeNotes = [];
  score = 0;
  combo = 0;
  maxCombo = 0;
  paused = false;
  numPlayedNotes = 0;
  accuracy = 0; // numHits / numHits + numMisses * 2
  numHits = 0;
  numMisses = 0;
  notesFinished = false;
  particles = [];
  endingCredits.stop();
  applause.stop();
  wedidit.stop();
  song.stop();
  song.play();
  songEnded = false;
  loop();
}

function play() {
  song.play();
  paused = false;
  console.log("play");
  loop();
  noCursor();
}

function pause() {
  song.pause();
  paused = true;
  console.log("pause");
  noLoop();
  cursor();
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

function hit() {
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

function endSong() {
  console.log("stage complete");
  songEnded = true;
  song.stop();
}

function keyPressed() {
  // console.log(keyCode);
  if (keyCode === 32) {
    if (notesFinished) {
      endSong();
    } else paused ? play() : pause();
    return false; // prevent scroll
  }
  if (keyCode === 13) {
    if (notesFinished) {
      endSong();
    } else paused ? play() : pause();
  }
  if (keyCode === 27) {
    if (notesFinished) {
      endSong();
    } else paused ? play() : pause();
  }
}

function doubleClicked() {
  fullscreen(true);
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
    let shortestLength = SIZE;
    anchorPoints.forEach((b, i) => {
      if (mobile) {
        if (mobile == 2) {
          posY = WIDTH / 2 + (mouseY - HEIGHT + 250 * PX) * 1.5;
          posX = WIDTH / 2 + (mouseX - WIDTH / 2) * 1.5;
        }
        if (mobile == 1) {
          posY = WIDTH / 2 + (mouseY - HEIGHT + 120) * 3;
          posX = WIDTH / 2 + (mouseX - WIDTH + 120) * 3;
        }
      } else {
        posX = mouseX;
        posY = mouseY;
      }
      const d = dist(b.x, b.y, posX, posY);
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
      if (currBreak || notesFinished) fill(0);
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
  noLoop();
  cursor();
  dateTime = new Date();
  endingCredits.play();
  applause.play();
  applause.onended(() => wedidit.play());
  drawingContext.shadowBlur = 0;
  btnRetry.mousePressed(retry);
  btnRetry.show();
  background(0);
  imageMode(CORNER);
  rectMode(CORNER);
  image(endbg, 0, 0, WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT, COVER);
  // dark background
  noStroke();
  fill(0, 0, 0, 80);
  rect(0, 0, WIDTH, HEIGHT);
  fill(0, 0, 0, 100);
  rect(WIDTH / 2 - 100 * PX, SIZE - 120 * PX, 200 * PX, 100 * PX, 10 * PX);
  if (accuracy == 100) {
    image(rankS, 100 * PX, 145 * PX, 280 * PX, 330 * PX);
  } else if (accuracy > 93) {
    image(rankA, 105 * PX, 145 * PX, 280 * PX, 330 * PX);
  } else if (accuracy > 83) {
    image(rankB, 115 * PX, 145 * PX, 280 * PX, 330 * PX);
  } else if (accuracy > 73) {
    image(rankC, 105 * PX, 145 * PX, 270 * PX, 330 * PX);
  } else {
    image(rankD, 105 * PX, 145 * PX, 270 * PX, 330 * PX);
  }
  image(
    hitsIcon,
    mobile == 0 ? WIDTH / 2 + 60 * PX : WIDTH - 340 * PX,
    200 * PX,
    60 * PX,
    60 * PX
  );
  image(
    missesIcon,
    mobile == 0 ? WIDTH / 2 + 60 * PX : WIDTH - 340 * PX,
    280 * PX,
    60 * PX,
    60 * PX
  );
  image(
    accuracyIcon,
    mobile == 0 ? WIDTH / 2 + 60 * PX : WIDTH - 340 * PX,
    360 * PX,
    60 * PX,
    60 * PX
  );
  fill(255);
  // fill(241, 241, 241);
  fill(242, 242, 242);
  stroke(0);
  strokeWeight(3 * PX);
  textAlign(LEFT);
  textSize(40 * PX);
  text(track.title, 90 * PX, 80 * PX);
  textSize(12 * PX);
  text(dateTime.toString(), 90 * PX, 105 * PX);
  textAlign(RIGHT);
  textSize(56 * PX);
  text(nfc(numHits), WIDTH - 90 * PX, 243 * PX);
  text(nfc(numMisses), WIDTH - 90 * PX, 323 * PX);
  text(accuracy + "%", WIDTH - 90 * PX, 403 * PX);
  textAlign(CENTER);
  textSize(80 * PX);
  text(nfc(score), WIDTH / 2, 545 * PX);
  textAlign(RIGHT);
  textSize(48 * PX);
  image(maxComboIcon, WIDTH / 2 - 200 * PX, 575 * PX, 200 * PX, 80 * PX);
  text(nfc(maxCombo), WIDTH / 2 + 130 * PX, 630 * PX);
  textSize(20 * PX);
  text("x" + nfc(numAttempts), WIDTH - 90 * PX, 780 * PX);
  textAlign(LEFT);
  let seconds = Math.floor((songDuration / 1000) % 60);
  let minutes = Math.floor(songDuration / 1000 / 60);
  const textSeconds = seconds < 10 ? "0" + seconds : "" + seconds;
  const textMinutes = minutes < 10 ? "0" + minutes : "" + minutes;
  text(textMinutes + ":" + textSeconds, 90 * PX, 780 * PX); // todo fix formatting
  const numStars = Math.floor(track.difficulty);
  //stars
  for (i = 0; i < numStars; i++) {
    image(star, WIDTH - 220 * PX - i * 30 * PX, 85 * PX, 30 * PX, 30 * PX);
  }
  image(
    star,
    WIDTH - 190 * PX,
    85 * PX,
    (track.difficulty - numStars) * 30 * PX,
    30 * PX,
    0,
    0,
    40 * PX,
    40 * PX,
    COVER,
    LEFT
  );
  textSize(30 * PX);
  textAlign(RIGHT);
  text(track.difficulty, WIDTH - 90 * PX, 110 * PX);
}

function draw() {
  if (notesFinished && songEnded) {
    clear();
    displayResults();
    return;
  }
  currTime = Math.floor(song.currentTime() * 1000) - DELAY;
  background(0);
  translate(WIDTH / 2, HALF);
  imageMode(CENTER);
  rectMode(CENTER);
  if (ANALYZE_AUDIO) {
    fft.analyze();
    amp = fft.getEnergy(20, 200);
    push();
    if (amp > 225 && IMAGE_TILT) {
      rotate(random(radians(-0.5), radians(0.5)));
    }
  }

  image(
    trackBg,
    0,
    0,
    WIDTH + 20 * PX,
    HEIGHT + 20 * PX,
    0,
    0,
    WIDTH,
    HEIGHT,
    COVER
  );
  if (ANALYZE_AUDIO) {
    pop();
  }
  translate(-WIDTH / 2, -HALF);
  // dark filter
  let alpha =
    OPACITY_FLICKER && ANALYZE_AUDIO ? map(amp, 0, 255, 150, 200) : 160;
  fill(0, alpha);
  noStroke();
  rect(WIDTH / 2, HALF, WIDTH, HEIGHT);

  // text
  let fps = frameRate();
  drawingContext.shadowBlur = 0;
  fill(255);
  stroke(0);
  strokeWeight(3 * PX);
  textAlign(LEFT);
  textSize(60 * PX);
  text(nfc(combo), 10 * PX, (mobile ? SIZE : HEIGHT) - 10 * PX);
  textSize(30 * PX);
  text(nfc(accuracy) + "%", 10 * PX, 40 * PX);
  textAlign(RIGHT);
  textSize(30 * PX);
  text(nfc(score), WIDTH - 10 * PX, 40 * PX);
  textSize(12 * PX);
  text(
    "FPS: " + fps.toFixed(2),
    WIDTH - 10 * PX,
    (mobile ? SIZE : HEIGHT) - 10 * PX
  );
  // progress bar
  drawingContext.shadowColor = "black";
  drawingContext.shadowBlur = 12 * PX;
  stroke(255, 0, 0);
  strokeWeight(18 * PX);
  x = map(currTime, 0, songDuration, 0, WIDTH);
  line(0, 0, x, 0);

  // PIE GLOW
  fill(255);
  strokeWeight(0);
  translate(WIDTH / 2, HALF);
  drawingContext.shadowColor = "white";
  drawingContext.shadowBlur = 50 * PX;
  ellipse(0, 0, edgeLength + NOTE_SIZE);
  drawingContext.shadowBlur = 0;
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

  // audio visualization
  if (SHOW_WAVEFORM && ANALYZE_AUDIO) {
    push();
    rotate(radians(90 + 45 / 2));
    stroke(SLICE_COLOR);
    noFill();
    strokeWeight(3);
    angleMode(DEGREES);
    let wave = fft.waveform();
    for (t = -1; t <= 1; t += 2) {
      beginShape();
      for (i = 0; i < WIDTH; i += 0.5) {
        let index = floor(map(i, 0, 180, 0, wave.length - 1));

        let r = map(wave[index], -1, 1, edgeLength, 0);
        let x = r * sin(i) * t;
        let y = r * cos(i);
        vertex(x, y);
      }
      endShape();
    }
    angleMode(RADIANS);
    pop();
  }

  // NOTES
  noFill();
  strokeWeight(NOTE_SIZE * 2);
  stroke(NOTE_COLOR);
  drawingContext.shadowBlur = 50 * PX;
  drawingContext.shadowColor = NOTE_GLOW;
  try {
    if (
      notes.length === 0 &&
      activeNotes.length === 0 &&
      notesToPlay.length === 0 &&
      numPlayedNotes > 0
    ) {
      notesFinished = true;
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
        currBreak = true;
        const halftime =
          nextBreak.startTime + nextBreak.endTime - nextBreak.startTime;
        if (currTime > halftime && currTime < halftime + 2000) {
          // todo add health mechanics
          // todo play section pass/fail sound
          // todo show section pass/fail icon
          if (accuracy > 83) {
            image(sectionPass, WIDTH / 2, HALF - 100 * PX, 50 * PX, 50 * PX);
            console.log("section passed");
          } else {
            image(sectionFail, WIDTH / 2, HALF - 100 * PX, 50 * PX, 50 * PX);
            console.log("section failed");
          }
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
      for (i = activeNotes.length - 1; i >= 0; i--) {
        const life = (activeNotes[i].time - currTime) / approachTime; // (.52) percent of life the note has left;
        const radius = edgeLength - Math.floor(edgeLength * life); // where the note should be based on the timestamp
        barNote(radius, activeNotes[i].path);
        //collision check
        if (
          edgeLength - radius > -(NOTE_SIZE * 2) &&
          edgeLength - radius < NOTE_SIZE * 2 &&
          activeNotes[i].path === activeSlice()
        ) {
          // stroke of note is touching stroke of landing region
          notesToPlay.push({
            time: activeNotes[i].time,
            sound: activeNotes[i].hitSound,
            path: activeNotes[i].path,
          });
          hit();
          activeNotes.splice(i, 1);
        }
        //exit check
        if (radius > edgeLength + NOTE_SIZE * 4) {
          activeNotes.splice(i, 1);
          miss();
        }
      }
    }
  } catch (e) {
    console.log(e);
    pause();
  }
  // particles
  if (fps > 30 && SHOW_PARTICLES && ANALYZE_AUDIO) {
    let p1 = new Particle();
    particles.push(p1);
    for (i = particles.length - 1; i >= 0; i--) {
      if (particles[i].edges()) {
        particles.splice(i, 1);
      } else {
        particles[i].update(amp > 210);
        particles[i].show();
      }
    }
  }
  rotate(radians(90 + 45 / 2));
  translate(-WIDTH / 2, -HALF);
  drawingContext.shadowColor = "white";
  drawingContext.shadowBlur = 30 * PX;
  // MOBILE DPAD
  if (mobile) {
    fill(SLICE_COLOR);
    strokeWeight(NOTE_SIZE * 2);
    stroke(CURSOR_COLOR);
    ellipse(WIDTH / 2, HEIGHT - edgeLength - NOTE_SIZE);
  }
  // MOUSE LINE
  strokeWeight(CURSOR_SIZE * PX);
  stroke(CURSOR_COLOR);
  let pPosX, pPosY;
  if (mobile) {
    if (mobile == 2) {
      pPosY = WIDTH / 2 + (pmouseY - HEIGHT + 250 * PX) * 1.5;
      pPosX = WIDTH / 2 + (pmouseX - WIDTH / 2) * 1.5;
    }
    if (mobile == 1) {
      pPosY = WIDTH / 2 + (pmouseY - HEIGHT + 120) * 3;
      pPosX = WIDTH / 2 + (pmouseX - WIDTH + 120) * 3;
    }
  } else {
    pPosY = pmouseY;
    pPosX = pmouseX;
  }
  line(posX, posY, pPosX, pPosY);
  // ANCHOR CIRCLE
  drawingContext.shadowBlur = 0;
  noStroke();
  fill(255, 255, 255);
  ellipse(
    WIDTH / 2,
    HALF,
    ANCHOR_BEAT && ANALYZE_AUDIO
      ? map(amp, 0, 250, 6 * PX, 12 * PX) + (amp > 210 ? 2 : 0)
      : 10 * PX
  );
}

class Particle {
  constructor() {
    this.pos = p5.Vector.random2D().mult(edgeLength + NOTE_SIZE);
    this.vel = createVector(0, 0);
    this.w = random(2 * PX, 4 * PX);
    this.acc = this.pos.copy().mult(random(0.001, 0.0001) / (this.w * 5));
    this.color = (random(180, 255), random(180, 255), random(180, 255));
  }

  update(condition) {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    if (condition) {
      this.pos.add(this.vel);
      this.pos.add(this.vel);
      this.pos.add(this.vel);
    }
  }

  edges() {
    if (
      this.pos.x > WIDTH ||
      this.pos.x < -WIDTH ||
      this.pos.y > HEIGHT ||
      this.pos.y < -HEIGHT
    ) {
      return true;
    } else return false;
  }

  show() {
    noStroke();
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, this.w);
  }
}
