/*
 * @Description: 页面测试用 WebSocket 服务器
 * @Author: ChenQiang
 * @Date: 2024-04-19 15:32:54
 * @LastEditors: ChenQiang
 * @LastEditTime: 2024-04-24 17:26:29
 * @FilePath: \test\page\nodeServer\app.ts
 */
import WebSocket from 'ws';

const port = 1134;
const HEART_MESSAGE = 'heartMessage';

// 创建一个WebSocket服务器，监听特定的端口
const wss = new WebSocket.Server({ port: port });

// 当客户端连接时触发
wss.on('connection', function connection(ws: WebSocket) {
  console.log('connection open');

  ws.on('message', function incoming(message: WebSocket.RawData) {
    const msg = message.toString();
    console.log('received: %s', msg);

    // 心跳消息不回复，用于测试客户端 waitTime 超时
    if (msg === HEART_MESSAGE) {
      console.log('heartMessage ignored (for heart timeout test)');
      return;
    }

    ws.send('Hello, you sent -> ' + msg);
  });

  // 连接时不主动发消息，避免重置客户端心跳 waitTime 计时

  // 当客户端断开连接时触发
  ws.on('close', function close() {
    console.log('connection closed');
  });
});

console.log('WebSocket Server is running on port %s', port);
