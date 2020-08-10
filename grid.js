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

module.exports = { uFrame, merge, valueAt, pad };
