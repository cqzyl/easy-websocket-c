/*
 * @Description: 启动一个socket服务器
 * @Author: ChenQiang
 * @Date: 2024-04-19 15:32:54
 * @LastEditors: ChenQiang
 * @LastEditTime: 2024-04-24 17:26:29
 * @FilePath: \test\nodeServer\app.ts
 */
// import * as net from 'net';

// const server = net.createServer((socket: net.Socket) => {
//   socket.on('data', (data: Buffer) => {
//     console.log(`Received: ${data.toString()}`);
//     socket.write(`Hello from server! You said: ${data.toString()}`);
//   });

//   socket.on('end', (reason: any) => {
//     console.log('Connection ended:', reason);
//     console.log('客户端关闭连接');

//   });
//   socket.on('close', (reason) => {
//     console.log('Connection closed:', reason);
//   });

//   socket.on('error', (err) => {
//     console.error('Socket error:', err);
//   });

// });

// server.on('error', (err: Error) => {
//   throw err;
// });

// const port = 1134;
// server.listen(port, () => {
//   console.log('Server is listening on port %s', port);
// });
// const WebSocket = require('ws');
import WebSocket from 'ws';

const port = 1134;

// 创建一个WebSocket服务器，监听特定的端口
const wss = new WebSocket.Server({ port: port });

// 当客户端连接时触发
wss.on('connection', function connection(ws: WebSocket) {
  console.log('connection open');

  ws.on('message', function incoming(message: WebSocket.RawData) {
    console.log('received: %s', message);

    // 向客户端发送消息
    ws.send('Hello, you sent -> ' + message);
  });

  ws.send('Hi there, I am a WebSocket server!');

  // 当客户端断开连接时触发
  ws.on('close', function close() {
    console.log('connection closed');
  });
});

console.log('WebSocket Server is running on port %s', port);
