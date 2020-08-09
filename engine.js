const times = require("lodash.times");
const { merge, uFrame, valueAt } = require("./grid");
const PIECES = require("./pieces");

const randomPiece = (pieces) =>
  pieces[Math.floor(Math.random() * pieces.length)];

const emptyRow = (width) => () => times(width, () => false);

const emptyWorld = (w, h) => times(h, emptyRow(w));

const center = (piece, width) => Math.floor((width - piece[0].length) / 2);

const overlaps = (world, piece, x, y) =>
  world.find((row, i) =>
    row.find((cell, j) => cell && valueAt(piece, j - x, i - y))
  ) !== undefined;

// eslint-disable-next-line no-unused-vars
const rotateCCW = (piece) =>
  times(piece.length, (i) =>
    times(piece[0].length, (j) => piece[j][piece[0].length - 1 - i])
  );

const rotateCW = (piece) =>
  times(piece.length, (i) =>
    times(piece[0].length, (j) => piece[piece.length - 1 - j][i])
  );

const dropFull = (world) =>
  world.filter((row) => row.find((state) => !state) !== undefined);

const padTop = (world, h) => [
  ...times(h - world.length, emptyRow(world[0].length)),
  ...world,
];

const attemptMutation = (state, mutationFn) => {
  const newState = mutationFn(state);
  return overlaps(
    uFrame(padTop(state.world, state.world.length + state.piece.length)),
    newState.piece,
    newState.x + 1,
    newState.y + state.piece.length
  )
    ? state
    : newState;
};

const handlers = {
  left: (state) => ({ ...state, x: state.x - 1 }),
  right: (state) => ({ ...state, x: state.x + 1 }),
  up: (state) => ({ ...state, piece: rotateCW(state.piece) }),
  down: (state) => ({ ...state, y: state.y + 1 }),
};

const nextPiece = (state) => {
  const piece = randomPiece(PIECES);
  return {
    ...state,
    piece,
    x: center(piece, state.world[0].length),
    y: 1 - piece.length,
  };
};

const clean = (state) =>
  padTop(
    dropFull(merge(state.world, state.piece, state.x, state.y)),
    state.world.length
  );

const tick = (state) => {
  const drop = attemptMutation(state, handlers.down);
  if (drop.y !== state.y) {
    return drop;
  }

  const next = nextPiece({
    ...state,
    world: clean(state),
  });

  if (overlaps(next.world, next.piece, next.x, next.y)) {
    return { ...drop, over: true };
  }

  return next;
};

const control = (state, key) => attemptMutation(state, handlers[key]);

const start = (w, h) =>
  nextPiece({
    world: emptyWorld(w, h),
    over: false,
  });

module.exports = {
  tick,
  control,
  start,
};
