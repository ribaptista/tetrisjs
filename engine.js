const times = require("lodash.times");
const { merge, uFrame, valueAt, pad } = require("./grid");
const PIECES = require("./pieces");

const randomPiece = (pieces) =>
  pieces[Math.floor(Math.random() * pieces.length)];

const emptyRow = (width) => () => times(width, () => 0);

const emptyWorld = (w, h) => times(h, emptyRow(w));

const center = (piece, width) => Math.floor((width - piece[0].length) / 2);

const overlaps = (world, piece, x, y) =>
  world.findIndex(
    (row, i) =>
      row.findIndex(
        (cell, j) => cell > 0 && valueAt(piece, j - x, i - y) > 0
      ) !== -1
  ) !== -1;

// eslint-disable-next-line no-unused-vars
const rotateCCW = (piece) =>
  times(piece.length, (i) =>
    times(piece[0].length, (j) => piece[j][piece[0].length - 1 - i])
  );

const rotateCW = (piece) =>
  times(piece.length, (i) =>
    times(piece[0].length, (j) => piece[piece.length - 1 - j][i])
  );

const padTop = (world, h) => [
  ...times(h - world.length, emptyRow(world[0].length)),
  ...world,
];

const crop = (world, l, t, w) =>
  world.slice(t).map((row) => row.slice(l, l + w));

const transpose = (grid) =>
  grid[0].map((cell, j) => grid.map((_, i) => grid[i][j]));

const gap = (row, pieceRow) => {
  const trim = row.slice(
    pieceRow.length - [...pieceRow].reverse().findIndex((v) => v !== 0)
  );
  return [...trim, 1].findIndex((v) => v !== 0);
};

const minGap = (grid, tPiece) =>
  Math.min(...grid.map((row, i) => gap(row, tPiece[i])));

const distance = ({ world, piece, x, y }) => {
  const pieceH = piece.length;
  const pieceW = piece[0].length;
  const tPiece = transpose(piece);
  return minGap(
    transpose(
      crop(
        pad(world, pieceW, pieceH, pieceW, 0, 0),
        x + pieceW,
        y + pieceH,
        pieceW
      )
    ).filter((_, i) => tPiece[i].findIndex((v) => v !== 0) !== -1),
    tPiece.filter((row) => row.findIndex((v) => v !== 0) !== -1)
  );
};

const attemptMutation = (state, mutationFn) => {
  const newState = mutationFn(state);
  return overlaps(
    uFrame(padTop(state.world, state.world.length + state.piece.length), 9),
    newState.piece,
    newState.x + 1,
    newState.y + state.piece.length
  )
    ? state
    : newState;
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

const dropFull = (world) => world.filter((row) => row.includes(0));

const clean = (state) =>
  padTop(
    dropFull(merge(state.world, state.piece, state.x, state.y)),
    state.world.length
  );

const settle = (state) => {
  const cleaned = clean(state);
  const next = nextPiece({
    ...state,
    world: cleaned,
  });

  if (overlaps(next.world, next.piece, next.x, next.y)) {
    return { ...next, over: true };
  }

  return next;
};

const handlers = {
  left: (state) => ({ ...state, x: state.x - 1 }),
  right: (state) => ({ ...state, x: state.x + 1 }),
  up: (state) => ({ ...state, piece: rotateCW(state.piece) }),
  down: (state) => ({ ...state, y: state.y + 1 }),
  drop: (state) => settle({ ...state, y: state.y + distance(state) }),
};

const tick = (state) => {
  const drop = attemptMutation(state, handlers.down);
  if (drop.y !== state.y) {
    return drop;
  }

  return settle(drop);
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
  distance,
};
