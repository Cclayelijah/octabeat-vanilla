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
  approachRate = text.slice(13, text.indexOf("\n")).trim();

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
    // console.log(`path:${path}, time:${time}`);
    // console.log(`x:${x}, y:${y}, time:${time}`);
    notes.push({ path, time, type, hitSound, played: false });
  });

  return { title, approachRate, notes };
}

const getTrack = async (contents) => {
  // const path = "/Easy.txt";
  const data = await extract(contents);
  // console.log(data);
  // return { ...data, audio: "/res/mayday/audio.mp3" };
  return { ...data };
};
