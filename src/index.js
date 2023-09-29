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

  try {
    const worker = new Worker(FPS_WORKER_PATH);
    worker.onmessage = (e) => {
      document.getElementById('fps').innerText = e.data;
    };
    return worker;
  } catch (error) {
    console.error('Failed to create FPS worker:', error);
  }
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

  const workerPromises = Array.from({ length: COUNT }, (_, i) => {
    try {
      const worker = new Worker(WORKER_PATH);
      return new Promise((resolve) => {
        worker.onmessage = (e) => {
          handleWorkerMessage(i)(e);
          resolveCounter++;
          if (resolveCounter === COUNT) {
            resolveFunctions.forEach((fn) => fn());
            // reset counters after resolving all promises
            resolveCounter = 0;
            resolveFunctions = [];
          }
        };
      });
    } catch (error) {
      console.error('Failed to create worker:', error);
    }
  });

  return { workers: workerPromises.map((promise) => promise.worker), workerPromises };
}

async function update(workerPromises) {
  await Promise.all(workerPromises);
}

async function gameLoop(workerPromises) {
  fpsWorker.postMessage('tick');

  previousGrid = draw(changedCells, currentGrid);
  await update(workerPromises);

  requestAnimationFrame(() => gameLoop(workerPromises));
}

const fpsWorker = initializeFpsWorker();
initializeCanvas();
const { workers, workerPromises } = initializeWorkers();
requestAnimationFrame(() => gameLoop(workerPromises));
