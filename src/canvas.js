import { CFG } from './config.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

export const initializeCanvas = () => {
  const { CELL_SIZE, PADDING, CONTROLS_WIDTH } = CFG.GRID;
  const { BORDER, BORDER_R, BG_C } = CFG.CANVAS;

  const width = Math.floor((window.innerWidth - PADDING * 2 - CONTROLS_WIDTH) / CELL_SIZE);
  const height = Math.floor((window.innerHeight - PADDING * 2) / CELL_SIZE);

  canvas.width = width * CELL_SIZE;
  canvas.height = height * CELL_SIZE;
  canvas.style.position = 'absolute';
  canvas.style.left = `${PADDING}px`;
  canvas.style.top = `${PADDING}px`;
  canvas.style.border = BORDER;
  canvas.style.borderRadius = BORDER_R;
  canvas.style.backgroundColor = BG_C;
};

export const draw = (setOfChanges = new Set(), currentGrid = [0][0]) => {
  const { CELL_SIZE } = CFG.GRID;

  setOfChanges.forEach((cell) => {
    const [x, y] = cell.split(',').map(Number);
    if (currentGrid[x][y]) {
      ctx.fillStyle = 'purple';
      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    } else {
      ctx.fillStyle = 'rgba(255,255,255, 0.7)';
      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  });
  // return a deep copy of the current grid as the previous grid
  return currentGrid.map((row) => row.slice());
};
