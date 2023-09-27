export function generateRandomValues(size) {
  return Array.from({ length: size }, () => Math.random());
}
export function seedRandomDataWithPreGeneratedValues(
  grid,
  probability,
  randomValues
) {
  let index = 0;
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      if (randomValues[index++] > probability) grid[x][y] = true;
    }
  }
  return grid;
}
