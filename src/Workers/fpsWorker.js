let lastTime = Date.now();
let frames = 0;

self.onmessage = function (e) {
  if (e.data === 'tick') {
    frames++;
    const now = Date.now();
    const delta = now - lastTime;
    if (delta >= 1000) {
      self.postMessage(`FPS: ${frames}`);
      frames = 0;
      lastTime = now;
    }
  }
};
