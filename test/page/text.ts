import EasyWebSocketC from '../../src/index.ts'


const socket = new EasyWebSocketC({
  autoContect: {
    max: 10,
    onlineContect: true,
    timeContect: 1000,
    abdicationTime: 1 * 1000,
  },
  heart: {
    message: 'heartMessage',
    waitTime: 12 * 1000, // 12s 内无服务端消息则判定离线
    timeContect: 5 * 1000, // 每 5s 发送一次心跳
  }
});

const wsUrl = 'ws://localhost:1134'
// const wsUrl = 'ws://82.157.123.54:9010/ajaxchattest'


socket.open(wsUrl).onOpen(() => {
  console.log('onOpen')
}).onClose((ev) => {
  console.log('onClose--------------', ev)
}).onHeartClose((ev) => {
  console.log('onHeartClose--------------', ev)
}).onError(() => {
  console.log('onError')
}).onMessage((cb) => {
  console.log('onMessage', cb.data)
}).onOffline(() => {
  console.log('onOffline')
}).onOnline(() => {
  console.log('onOnline')
})
global.socket = socket;
