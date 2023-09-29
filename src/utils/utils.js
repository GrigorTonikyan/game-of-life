export function generateRandomValues(gridX, gridY) {
  const size = gridX * gridY;
  return Array.from({ length: size }, () => Math.random());
}

export function seedRandomData(grid, probability, randomValues) {
  let index = 0;
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      if (randomValues[index++] > probability) grid[x][y] = true;
    }
  }
  return grid;
}

export const createEmptyGrid = (width, height) => {
  return Array(width)
    .fill(null)
    .map(() => Array(height).fill(false));
};

export const get2DArraysChanges = (gridX, gridY, previous = [false][false], current = [false][false]) => {
  const changedCells = new Set();
  for (let x = 0; x < gridX; x++) {
    for (let y = 0; y < gridY; y++) {
      if (previous[x][y] !== current[x][y]) {
        changedCells.add(`${x},${y}`);
      }
    }
  }
  // returns a set of strings in the format "x,y"
  return changedCells;
};
