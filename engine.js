const times = require("lodash.times");
const {
  merge,
  valueAt,
  pad,
  asCols,
  asCol,
  colIt,
  lastIndex,
  findIndex,
} = require("./grid");
const PIECES = require("./pieces");

const WALL = PIECES.length;

const randomPiece = (pieces) =>
  pieces[Math.floor(Math.random() * pieces.length)];

const biggestPiece = (pieces) =>
  Math.max(...pieces.map((piece) => piece.length));

const emptyRow = (width) => () => times(width, () => 0);

const container = (w, h) => times(h, emptyRow(w));

const cleanRows = (w, h, p) =>
  pad(pad(container(w, h), 1, 0, 1, 0, WALL), p, 0, p, 0, WALL);

const canvas = (w, h, p) =>
  pad(pad(container(w, h), 1, 0, 1, 1, WALL), p, 0, p, 0, WALL);

const center = (piece, width) => Math.floor((width - piece[0].length) / 2);

const overlaps = (world, piece, x, y) =>
  piece.findIndex(
    (row, i) =>
      row.findIndex(
        (cell, j) => cell > 0 && valueAt(world, j + x, i + y) > 0
      ) !== -1
  ) !== -1;

// eslint-disable-next-line no-unused-vars
const rotateCCW = (piece) =>
  times(piece.length, (i) =>
    times(piece[0].length, (j) => piece[j][piece[0].length - 1 - i])
  );

const rotateCW = (piece) =>
  piece.map((row, i) => row.map((cell, j) => piece[piece.length - 1 - j][i]));

const padTop = (world, padding, h) => [
  ...cleanRows(world[0].length - padding * 2 - 2, h - world.length, padding),
  ...world,
];

const gap = (col) => findIndex(col, (v) => v !== 0);

const minGap = (colIts) => Math.min(...colIts.map(gap));

const pieceBottom = (piece, col) => {
  const it = colIt(asCol(piece, col), 0, piece.length);
  return lastIndex(it, (v) => v !== 0);
};

const distance = (state) => {
  const worldCols = asCols(
    state.world,
    state.x,
    state.x + state.piece[0].length
  );
  const offsets = worldCols.map((col, i) => ({
    col,
    from: pieceBottom(state.piece, i),
  }));
  return minGap(
    offsets
      .filter(({ from }) => from !== -1)
      .map(({ col, from }) =>
        colIt(col, state.y + from + 1, state.world.length)
      )
  );
};

const attemptMutation = (state, mutationFn) => {
  const newState = mutationFn(state);
  return overlaps(state.world, newState.piece, newState.x, newState.y)
    ? state
    : newState;
};

const nextPiece = (state) => {
  const piece = randomPiece(PIECES);
  return {
    ...state,
    piece,
    x: center(piece, state.world[0].length),
    y: state.padding + 1 - piece.length,
  };
};

const dropFull = (world) =>
  world.filter((row, i) => row.includes(0) || i === world.length - 1);

const clean = (state) => {
  return padTop(dropFull(state.world), state.padding, state.world.length);
};

const mergePiece = (state) => {
  return {
    ...state,
    world: merge(state.world, state.piece, state.x, state.y),
  };
};

const settle = (state) => {
  const merged = mergePiece(state);
  const cleaned = clean(merged);
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

const start = (w, h) => {
  const padding = biggestPiece(PIECES);
  return nextPiece({
    world: canvas(w, h + padding, padding),
    padding,
    over: false,
  });
};

const view = (state) =>
  state.world
    .slice(state.padding, state.world.length - 1)
    .map((row) => row.slice(state.padding + 1, row.length - state.padding - 1));

const coords = (state) => ({
  ...state,
  x: state.x - state.padding - 1,
  y: state.y - state.padding,
});

module.exports = {
  tick,
  control,
  start,
  distance,
  view,
  coords,
};
