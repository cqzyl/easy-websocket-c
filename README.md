# easy-websocket-c

> 用于简化websocket操作 npm i easy-websocket-c

使用示例
```
const a = new EasyWebSocketC();
a.open('ws://localhost:3000/socket').onOpen(() => {
  console.log('opened')
}).onError(err => {
  console.error(err)
}).onClose((event) => {
  console.log('close')
})
```