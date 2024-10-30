# game_server.py

import asyncio
import json
import random

import websockets

# Configuration Constants
CFG = {
    "CANVAS": {
        "BORDER": "1px solid black",
        "BORDER_R": "16px",
        "BG_C": "rgb(215 255 255 / 100%)",
    },
    "CELL": {
        "ALIVE_COLOR": "purple",
        "DEAD_COLOR": "rgba(255,255,255, 0.7)",
    },
    "GRID": {
        "CELL_SIZE": 8,
        "LIVE_CELL_PROBABILITY": 0.63,
        "PADDING": 16,
        "CONTROLS_WIDTH": 100,
    },
}


async def process_game_logic(grid):
    width = len(grid)
    height = len(grid[0])
    new_grid = [[False for _ in range(height)] for _ in range(width)]

    for x in range(width):
        for y in range(height):
            # Count live neighbors
            live_neighbors = 0
            for dx in [-1, 0, 1]:
                for dy in [-1, 0, 1]:
                    if dx == 0 and dy == 0:
                        continue
                    nx = (x + dx) % width
                    ny = (y + dy) % height
                    if grid[nx][ny]:
                        live_neighbors += 1
            # Apply the rules
            if grid[x][y]:
                new_grid[x][y] = live_neighbors == 2 or live_neighbors == 3
            else:
                new_grid[x][y] = live_neighbors == 3
    return new_grid


def seed_random_data(width, height, probability):
    grid = [[False for _ in range(height)] for _ in range(width)]
    for x in range(width):
        for y in range(height):
            grid[x][y] = random.random() < probability
    return grid


async def handler(websocket, path):
    try:
        grid = None
        async for message in websocket:
            data = json.loads(message)
            action = data.get("action")
            if action == "initialize":
                # Get width and height from client
                width = data.get("width")
                height = data.get("height")
                # Generate initial grid
                grid = seed_random_data(
                    width, height, CFG["GRID"]["LIVE_CELL_PROBABILITY"]
                )
                # Send settings and initial grid to client
                response = {
                    "action": "initialize",
                    "cellSize": CFG["GRID"]["CELL_SIZE"],
                    "grid": grid,
                }
                await websocket.send(json.dumps(response))
            elif action == "update":
                if grid is not None:
                    grid = await process_game_logic(grid)
                    # Send updated grid to client
                    response = {
                        "action": "update",
                        "grid": grid,
                    }
                    await websocket.send(json.dumps(response))
    except websockets.exceptions.ConnectionClosedError as e:
        print(f"Connection closed: {e}")


start_server = websockets.serve(
    handler,
    "localhost",
    8080,
    max_size=None,  # Disable maximum size limit
    compression=None,  # Optional: Disable compression
)


def main():
    asyncio.get_event_loop().run_until_complete(start_server)
    print("Python WebSocket server is running on ws://localhost:8080")
    asyncio.get_event_loop().run_forever()


if __name__ == "__main__":
    asyncio.run(start_server)
