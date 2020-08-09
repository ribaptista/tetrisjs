const times = require("lodash.times");

const uFrame = (world) => [
  ...world.map((row) => [true, ...row, true]),
  times(world[0].length + 2, () => true),
];

const valueAt = (grid, x, y) =>
  x >= 0 &&
  x < grid[0].length &&
  y >= 0 &&
  y < grid.length &&
  grid[y][x] !== " ";

const merge = (g1, g2, x, y) =>
  g1.map((row, i) => row.map((cell, j) => cell || valueAt(g2, j - x, i - y)));

module.exports = { uFrame, merge, valueAt };
