const times = require("lodash.times");

const uFrame = (world, value) => [
  ...world.map((row) => [value, ...row, value]),
  times(world[0].length + 2, () => value),
];

const padX = (grid, l, r, v) =>
  grid.map((row) => [...times(l, () => v), ...row, ...times(r, () => v)]);

const padY = (grid, t, b, v) => [
  ...times(t, () => times(grid[0].length, () => v)),
  ...grid,
  ...times(b, () => times(grid[0].length, () => v)),
];

const pad = (grid, l, t, r, b, v) => padY(padX(grid, l, r, v), t, b, v);

const valueAt = (grid, x, y) =>
  x >= 0 && x < grid[0].length && y >= 0 && y < grid.length ? grid[y][x] : 0;

const overlay = (top, bottom) => (top !== 0 ? top : bottom);

const merge = (g1, g2, x, y) =>
  g1.map((row, i) =>
    row.map((cell, j) => overlay(valueAt(g2, j - x, i - y), cell))
  );

const asCols = (grid, x0, x1) =>
  times(x1 - x0, (i) => ({
    grid,
    x: x0 + i,
  }));

const asCol = (grid, x) => asCols(grid, x, x + 1)[0];

function* colIt({ grid, x }, y0, y1) {
  for (let y = y0; y < y1; y += 1) {
    yield grid[y][x];
  }
}

function lastIndex(it, fn) {
  let last = -1;
  for (let next = it.next(), i = 0; !next.done; i += 1, next = it.next()) {
    if (fn(next.value)) {
      last = i;
    }
  }

  return last;
}

function findIndex(it, fn) {
  for (let next = it.next(), i = 0; !next.done; i += 1, next = it.next()) {
    if (fn(next.value)) {
      return i;
    }
  }

  return -1;
}

module.exports = {
  uFrame,
  merge,
  valueAt,
  pad,
  asCols,
  asCol,
  colIt,
  lastIndex,
  findIndex,
};
