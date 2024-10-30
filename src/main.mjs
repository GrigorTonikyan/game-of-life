import "./assets/styles/_index.css";
import { config } from "./constants";

// Canvas Initialization
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Initialize Grids
let grid = [];
let prevGrid = [];
let width = 0;
let height = 0;
let cellSize = 16; // Default value, will be updated from backend

// Initialize WebSocket (Will be connected after settings are loaded)
let socket;

// Event Listener for Start Button
document.getElementById("startButton").addEventListener("click", () => {
  width = parseInt(document.getElementById("gridWidth").value);
  height = parseInt(document.getElementById("gridHeight").value);
  initializeWebSocket();
});

function initializeWebSocket() {
  socket = new WebSocket(`${config.server.url}:${config.server.port}`);

  socket.addEventListener("open", function (event) {
    console.log("WebSocket connection established.");
    // Request settings and initial grid from backend
    socket.send(
      JSON.stringify({
        action: "initialize",
        width: width,
        height: height,
      })
    );
  });

  socket.addEventListener("message", function (event) {
    const data = JSON.parse(event.data);

    if (data.action === "initialize") {
      // Receive settings and initial grid from backend
      cellSize = data.cellSize;
      grid = data.grid;
      prevGrid = createEmptyGrid(width, height);
      initializeCanvas();
      gameLoop();
    } else if (data.action === "update") {
      grid = data.grid;
      draw();
    }
  });

  socket.addEventListener("close", function (event) {
    console.log("WebSocket connection closed.");
  });
}

// Function to Create Empty Grid
function createEmptyGrid(width, height) {
  return Array.from({ length: width }, () =>
    Array.from({ length: height }, () => false)
  );
}

// Function to Initialize Canvas
function initializeCanvas() {
  const PADDING = 16; // You can also get this from backend if needed

  const canvasWidth = width * cellSize;
  const canvasHeight = height * cellSize;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvas.style.position = "absolute";
  canvas.style.left = `${PADDING}px`;
  canvas.style.top = `${PADDING}px`;
  canvas.style.border = "1px solid black";
  canvas.style.borderRadius = "16px";
  canvas.style.backgroundColor = "rgb(215 255 255 / 100%)";
}

// Function to Draw Grid on Canvas
function draw() {
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (grid[x][y] !== prevGrid[x][y]) {
        ctx.fillStyle = grid[x][y]
          ? config.ui.colors.cell.alive
          : config.ui.colors.cell.dead;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }

  prevGrid = grid.map((row) => row.slice()); /* update previous grid */
}

// Function to Update Grid by Sending Data to Backend
function update() {
  if (!socket.readyState === WebSocket.OPEN) return;
  // Only send minimal data (e.g., user actions), but in this case, we don't have any
  socket.send(JSON.stringify({ action: "update" }));
}

function gameLoop() {
  update();
  /* Draw is called when data is received from the server */
  requestAnimationFrame(gameLoop);
}
