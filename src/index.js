import {
  generateRandomValues,
  seedRandomDataWithPreGeneratedValues,
} from "./utils/utils.js";

const CFG = {
  CANVAS: {
    BORDER: "1px solid black",
    BORDER_R: "16px",
    BG_C: "rgb(215 255 255 / 100%)",
  },
  CELL: {
    ALIVE_COLOR: "red",
    DEAD_COLOR: null,
  },
  GRID: {
    CELL_SIZE: 3,
    LIVE_CELL_PROBABILITY: 0.53,
    PADDING: 16,
    CONTROLS_WIDTH: 100,
  },
  WORKERS: {
    COUNT: 6,
    FPS_WORKER_PATH: "./Workers/fpsWorker.js",
    WORKER_PATH: "./Workers/worker.js",
  },
};

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const width = Math.floor(
  (window.innerWidth - CFG.GRID.PADDING * 2 - CFG.GRID.CONTROLS_WIDTH) /
    CFG.GRID.CELL_SIZE
);
const height = Math.floor(
  (window.innerHeight - CFG.GRID.PADDING * 2) / CFG.GRID.CELL_SIZE
);
const sectionHeight = Math.ceil(height / CFG.WORKERS.COUNT);

const changedCells = new Set(); // Use a Set to store changed cells
let prevGrid = createEmptyGrid(width, height);
let grid = seedRandomDataWithPreGeneratedValues(
  createEmptyGrid(width, height),
  CFG.GRID.LIVE_CELL_PROBABILITY,
  generateRandomValues(width * height)
);

initializeCanvas();
const fpsWorker = initializeFpsWorker();
const workers = initializeWorkers();

gameLoop();

function createEmptyGrid(width, height) {
  return Array(width)
    .fill(null)
    .map(() => Array(height).fill(false));
}

function initializeCanvas() {
  const { CELL_SIZE, PADDING, CONTROLS_WIDTH } = CFG.GRID;
  const { BORDER, BORDER_R, BG_C } = CFG.CANVAS;

  const width = Math.floor(
    (window.innerWidth - PADDING * 2 - CONTROLS_WIDTH) / CELL_SIZE
  );
  const height = Math.floor((window.innerHeight - PADDING * 2) / CELL_SIZE);

  canvas.width = width * CELL_SIZE;
  canvas.height = height * CELL_SIZE;
  canvas.style.position = "absolute";
  canvas.style.left = `${PADDING}px`;
  canvas.style.top = `${PADDING}px`;
  canvas.style.border = BORDER;
  canvas.style.borderRadius = BORDER_R;
  canvas.style.backgroundColor = BG_C;
}

function initializeFpsWorker() {
  const { FPS_WORKER_PATH } = CFG.WORKERS;

  const worker = new Worker(FPS_WORKER_PATH);
  worker.onmessage = (e) => {
    document.getElementById("fps").innerText = e.data;
  };
  return worker;
}

let resolveCounter = 0;
let resolveFunctions = [];

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

function draw() {
  const { CELL_SIZE } = CFG.GRID;

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (grid[x][y] !== prevGrid[x][y]) {
        changedCells.add(`${x},${y}`);
      }
    }
  }

  changedCells.forEach((cell) => {
    const [x, y] = cell.split(",").map(Number);
    if (grid[x][y]) {
      ctx.fillStyle = "purple";
      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    } else {
      ctx.fillStyle = "rgba(255,255,255, 0.7)";
      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  });
  changedCells.clear();

  prevGrid = grid.map((row) => row.slice());
}

function handleWorkerMessage(workerIndex) {
  return (e) => {
    const newSection = e.data;
    const yStart = workerIndex * sectionHeight;
    const yEnd = Math.min(yStart + sectionHeight, height);
    for (let x = 0; x < width; x++) {
      for (let y = yStart, j = workerIndex > 0 ? 1 : 0; y < yEnd; y++, j++) {
        grid[x][y] = newSection[x][j];
      }
    }
  };
}

async function update() {
  const workerCount = CFG.WORKERS.COUNT;

  const promises = workers.map((worker, i) => {
    const yStart = i * sectionHeight - (i > 0 ? 1 : 0);
    const yEnd = Math.min(
      yStart + sectionHeight + (i < workerCount - 1 ? 1 : 0),
      height
    );
    const section = grid.map((col) => col.slice(yStart, yEnd));
    return new Promise((resolve) => {
      resolveFunctions.push(resolve);
      worker.postMessage({
        grid: section,
        width: width,
        height: yEnd - yStart,
      });
    });
  });
  await Promise.all(promises);
}

async function gameLoop() {
  fpsWorker.postMessage("tick");

  update();
  draw();

  requestAnimationFrame(gameLoop);
}
