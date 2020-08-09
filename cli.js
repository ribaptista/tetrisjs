const readline = require("readline");
const log = require("log-update");
const chalk = require("chalk");
const { start, tick, control } = require("./engine.js");
const { merge, uFrame } = require("./grid");

const WORLD_W = 10;
const WORLD_H = 20;
const BLOCK = "▓";
const SPACE = " ";

const colors = [
  chalk.red,
  chalk.green,
  chalk.yellow,
  chalk.blue,
  chalk.magenta,
  chalk.cyan,
  chalk.white,
];

const render = (world) =>
  world
    .map((row) =>
      row
        .map((state) => (state !== 0 ? colors[state - 1](BLOCK) : SPACE))
        .join("")
    )
    .join("\n");

let state;

const update = (newState) => {
  if (newState.over) {
    console.log("Game over!"); // eslint-disable-line no-console
    process.exit();
  }

  state = newState;
  log(render(uFrame(merge(state.world, state.piece, state.x, state.y), 7)));
};

setInterval(() => {
  update(tick(state));
}, 300);

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on("keypress", (key, data) => {
  // eslint-disable-next-line default-case
  switch (data.name) {
    case "c":
      if (data.ctrl) {
        process.exit();
      }
      break;

    case "left":
    case "right":
    case "up":
    case "down":
      update(control(state, data.name));
  }
});

update(start(WORLD_W, WORLD_H));
