import { draw, initializeCanvas } from './canvas.js';
import { CFG } from './config.js';
import { createEmptyGrid, generateRandomValues, get2DArraysChanges, seedRandomData } from './utils/utils.js';

const { PADDING, LIVE_CELL, CONTROLS_WIDTH, CELL_SIZE } = CFG.GRID;
const { innerWidth: width, innerHeight: height } = window;
const gridX = Math.floor((width - PADDING * 2 - CONTROLS_WIDTH) / CELL_SIZE);
const gridY = Math.floor((height - PADDING * 2) / CELL_SIZE);
const sectionHeight = Math.ceil(gridY / CFG.WORKERS.COUNT);

let previousGrid = createEmptyGrid(gridX, gridY);
const currentGrid = seedRandomData(createEmptyGrid(gridX, gridY), LIVE_CELL, generateRandomValues(gridX, gridY));
const changedCells = get2DArraysChanges(gridX, gridY, previousGrid, currentGrid);

function initializeFpsWorker() {
  const { FPS_WORKER_PATH } = CFG.WORKERS;

  const worker = new Worker(FPS_WORKER_PATH);
  worker.onmessage = (e) => {
    document.getElementById('fps').innerText = e.data;
  };
  return worker;
}

let resolveCounter = 0;
let resolveFunctions = [];
function handleWorkerMessage(workerIndex) {
  return (e) => {
    const newSection = e.data;
    const yStart = workerIndex * sectionHeight;
    const yEnd = Math.min(yStart + sectionHeight, gridY);
    for (let x = 0; x < gridX; x++) {
      for (let y = yStart, j = workerIndex > 0 ? 1 : 0; y < yEnd; y++, j++) {
        currentGrid[x][y] = newSection[x][j];
      }
    }
  };
}
function initializeWorkers() {
  const { COUNT, WORKER_PATH } = CFG.WORKERS;

  return Array.from({ length: COUNT }, (_, i) => {
    const worker = new Worker(WORKER_PATH);
    worker.onmessage = (e) => {
      handleWorkerMessage(i)(e);
      resolveCounter++;
      if (resolveCounter === COUNT) {
        resolveFunctions.forEach((fn) => fn());
        resolveCounter = 0;
        resolveFunctions = [];
      }
    };
    return worker;
  });
}

async function update() {
  const workerCount = CFG.WORKERS.COUNT;

  const promises = workers.map((worker, i) => {
    const yStart = i * sectionHeight - (i > 0 ? 1 : 0);
    const yEnd = Math.min(yStart + sectionHeight + (i < workerCount - 1 ? 1 : 0), gridY);
    const section = currentGrid.map((col) => col.slice(yStart, yEnd));
    return new Promise((resolve) => {
      resolveFunctions.push(resolve);
      worker.postMessage({
        grid: section,
        width: gridX,
        height: yEnd - yStart,
      });
    });
  });
  await Promise.all(promises);
}

async function gameLoop() {
  fpsWorker.postMessage('tick');

  previousGrid = draw(changedCells, currentGrid);
  update();

  requestAnimationFrame(gameLoop);
}

const fpsWorker = initializeFpsWorker();
initializeCanvas();
const workers = initializeWorkers();
requestAnimationFrame(gameLoop);
