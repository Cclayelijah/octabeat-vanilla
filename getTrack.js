// var { readtext } = require("node:fs/promises");
// const paths = [
//     [0, 1],
//     [1, 1],
//     [1, 0],
//     [1, -1],
//     [0, -1],
//     [-1, -1],
//     [-1, 0],
//     [-1, 1],
//   ];

let lastPath = 0;
let totalPathLength = 0;
let totalBreakTime = 0;
let bgImage = "";
let breaks = [];

function shortestDistance(path1, path2) {
  // console.log("path1: " + path1);
  // console.log("path2: " + path2);
  let length = Math.abs(path1 - path2);
  if (length > 4) {
    length = 8 - length;
  }
  // console.log("shortestDist: " + length);
  return length;
}

function getPath(osuX, osuY) {
  const maxX = 512;
  const maxY = 384;
  let x = 1;
  let y = 1;
  let path = 0;

  if (osuX < (maxX / 3) * 2) x = 0;
  if (osuX < maxX / 3) x = -1;
  if (osuY < (maxY / 3) * 2) y = 0;
  if (osuY < maxY / 3) y = -1;
  if (x === 0 && y === 0) {
    if (Math.abs(x) < Math.abs(y)) {
      y = y < 0 ? -1 : 1;
    } else {
      x = x < 0 ? -1 : 1;
    }
  }

  // if (x == 0 && y == 1) path = 0;
  if (x == 1 && y == 1) path = 1;
  if (x == 1 && y == 0) path = 2;
  if (x == 1 && y == -1) path = 3;
  if (x == 0 && y == -1) path = 4;
  if (x == -1 && y == -1) path = 5;
  if (x == -1 && y == 0) path = 6;
  if (x == -1 && y == 1) path = 7;

  return path;
}

async function extract(contents) {
  //   let text = data ? data : "";
  let text = contents;
  let title = "";
  let notes = [];
  let approachRate = 3;

  // get title
  const reg1 = new RegExp("Title:");
  let index = text.search(reg1);
  text = text.slice(index);
  title = text.slice(6, text.indexOf("\n")).trim();

  // get approachRate
  const reg2 = new RegExp("ApproachRate:");
  index = text.search(reg2);
  text = text.slice(index);
  approachRate = Number(text.slice(13, text.indexOf("\n")).trim());

  // get breaks
  text = text.slice(text.indexOf("[Events]"));
  text = text.slice(text.indexOf("\n")).trim();
  const events = text.slice(0, text.indexOf("[TimingPoints]") - 1).trim();
  const eventData = events.split("\n");
  eventData.forEach((line) => {
    const event = line.trim().split(",");
    if (event[0] == "0") {
      bgImage = event[2].substring(1, event[2].length - 1);
      // console.log("bgImage: " + bgImage);
    }
    if (event[0] == "2") {
      totalBreakTime += event[2] - event[1];
      breaks.push({ startTime: event[1], endTime: event[2] });
    }
  });

  // get notes
  text = text.slice(text.indexOf("[HitObjects]"));
  text = text.slice(text.indexOf("\n")).trim();
  const noteData = text.split("\n");
  //console.log(noteData.length);
  noteData.map((line) => {
    const x = line.slice(0, line.indexOf(","));
    line = line.slice(line.indexOf(",") + 1);
    const y = line.slice(0, line.indexOf(","));
    line = line.slice(line.indexOf(",") + 1);
    const time = Number(line.slice(0, line.indexOf(",")));
    line = line.slice(line.indexOf(",") + 1);
    const type = Number(line.slice(0, line.indexOf(",")));
    // 0: Hit circle
    // 1: Slider
    // 3: Spinner
    // 7: osu!mania hold
    line = line.slice(line.indexOf(",") + 1);
    const hitSound = Number(line.slice(0, line.indexOf(",")));
    // 0: Normal
    // 1: Whistle
    // 2: Finish
    // 3: Clap
    const path = getPath(x, y);
    // calculate difficulty;
    const distance = shortestDistance(path, lastPath);
    totalPathLength += distance == 0 ? 500 : 1000;
    lastPath = path;
    notes.push({ path, time, type, hitSound, played: false });
  });

  const duration = notes[notes.length - 1].time - notes[0].time;
  const boost = approachRate > 9 ? approachRate - 9 : 0;
  const difficulty = (
    totalPathLength / (duration - totalBreakTime) +
    approachRate / 6 +
    boost
  ).toFixed(2);

  return { title, difficulty, approachRate, notes, breaks, bgImage };
}

const getTrack = async (contents) => {
  // const path = "/Easy.txt";
  const data = await extract(contents);
  // console.log(data);
  // return { ...data, audio: "/res/mayday/audio.mp3" };
  return { ...data };
};
