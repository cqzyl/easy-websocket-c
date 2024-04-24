import EasyWebSocketC from '../src/index.ts'


const socket = new EasyWebSocketC({
  autoContect: {
    max: 10,
    onlineContect: true,
    timeContect: 1000,
  }
});

const wsUrl = 'ws://localhost:1134'
// const wsUrl = 'ws://82.157.123.54:9010/ajaxchattest'


socket.open(wsUrl).onOpen(() => {
  console.log('onOpen')
}).onClose((ev) => {
  console.log('onClose--------------', ev)
}).onError(() => {
  console.log('onError')
}).onMessage((cb) => {
  console.log('onMessage')
}).onOffline(() => {
  console.log('onOffline')
}).onOnline(() => {
  console.log('onOnline')
})
global.socket = socket;