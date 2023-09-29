export const CFG = {
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
    LIVE_CELL: 0.53,
    PADDING: 16,
    CONTROLS_WIDTH: 100,
  },
  WORKERS: {
    COUNT: 4,
    FPS_WORKER_PATH: "./Workers/fpsWorker.js",
    WORKER_PATH: "./Workers/worker.js",
  },
};
