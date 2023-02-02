// var { readtext } = require("node:fs/promises");
// const CIRCLE_SIZE = 30;
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
  if (Math.abs(x) === Math.abs(y)) {
    // if equal, they aren't 0.
    x = (Math.sqrt(2) / 2) * x; // time by x to get sign.
    y = (Math.sqrt(2) / 2) * y;
  }

  return { xPath: x, yPath: y, xPos: CIRCLE_SIZE * x, yPos: CIRCLE_SIZE * y };
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
    const path = getPath(x, y);
    // console.log(`path:${path}, time:${time}`);
    // console.log(`x:${x}, y:${y}, time:${time}`);
    notes.push({ ...path, time, played: false });
  });

  return { title, approachRate, notes };
}

const getTrack = async (contents) => {
  // const path = "/Easy.txt";
  const data = await extract(contents);
  // console.log(data);
  return { ...data, audio: "/res/mayday/audio.mp3" };
};
