const readline = require("readline");
const log = require("log-update");
const chalk = require("chalk");
const { start, tick, control, distance } = require("./engine.js");
const { merge, uFrame } = require("./grid");

const WORLD_W = 10;
const WORLD_H = 20;
const BLOCK = "▓";
const GHOST = "░";
const SPACE = " ";
const WALL_VALUE = 7;
const GHOST_VALUE = 8;

const colors = [
  chalk.red,
  chalk.green,
  chalk.yellow,
  chalk.blue,
  chalk.magenta,
  chalk.cyan,
  chalk.white,
  chalk.grey,
];

const ghost = (piece) =>
  piece.map((row) => row.map((cell) => (cell === 0 ? 0 : GHOST_VALUE)));

const render = (world) =>
  world
    .map((row) =>
      row
        .map((v) =>
          v !== 0 ? colors[v - 1](v === GHOST_VALUE ? GHOST : BLOCK) : SPACE
        )
        .join("")
    )
    .join("\n");

let state;

const update = (newState) => {
  state = newState;
  if (newState.over) {
    log(render(uFrame(state.world, WALL_VALUE)));
    console.log("Game over!"); // eslint-disable-line no-console
    process.exit();
  }

  const m1 = merge(
    state.world,
    ghost(state.piece),
    state.x,
    state.y + distance(state)
  );
  const m2 = merge(m1, state.piece, state.x, state.y);
  log(render(uFrame(m2, WALL_VALUE)));
};

setInterval(() => {
  update(tick(state));
}, 1000);

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
      break;

    case "space":
      update(control(state, "drop"));
  }
});

update(start(WORLD_W, WORLD_H));
