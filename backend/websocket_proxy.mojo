const WebSocket = require('ws');
const net = require('net');

const TCP_HOST = 'localhost';
const TCP_PORT = 65432;
const WS_PORT = 8080;

const wss = new WebSocket.Server({ port: WS_PORT });

wss.on('connection', (ws) => {
  const tcpClient = new net.Socket();

  tcpClient.connect(TCP_PORT, TCP_HOST, () => {
    console.log('Connected to Mojo TCP server');
  });

  tcpClient.on('data', (data) => {
    ws.send(data.toString());
  });

  tcpClient.on('close', () => {
    ws.close();
  });

  ws.on('message', (message) => {
    tcpClient.write(message);
  });

  ws.on('close', () => {
    tcpClient.end();
  });
});

console.log(`WebSocket proxy server is running on ws://localhost:${WS_PORT}`);
