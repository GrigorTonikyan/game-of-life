self.onmessage = function (e) {
  const { grid, width, height } = e.data;
  const newGrid = computeNextState(grid, width, height);
  self.postMessage(newGrid);
};

function computeNextState(grid, width, height) {
  const newGrid = Array.from({ length: width }, () => Array(height).fill(false));

  function isAlive(x, y) {
    if (x < 0) x += width;
    if (y < 0) y += height;
    if (x >= width) x -= width;
    if (y >= height) y -= height;
    return grid[x][y];
  }

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let neighbors = 0;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i !== 0 || j !== 0) {
            neighbors += isAlive(x + i, y + j) ? 1 : 0;
          }
        }
      }
      newGrid[x][y] = (grid[x][y] && (neighbors === 2 || neighbors === 3)) || (!grid[x][y] && neighbors === 3);
    }
  }

  return newGrid;
}
