# easy-websocket-c

> 用于简化websocket操作 npm i easy-websocket-c
> 基于websocket增加了 断网心跳检测、联网自动重连 功能

使用示例
```
// 简单用法 默认联网重连，默认（服务端或者网络波动）意外断开自动重连
const a = new EasyWebSocketC();
a.open('ws://localhost:3000/socket').onOpen(() => {
  console.log('opened')
}).onError(err => {
  console.error(err)
}).onClose((event) => {
  console.log('close')
})

// 全配置写法
/**
 * @type { EasyWebSocketCOptions }
 */
const options = {
  /**
   * @type { boolean | AutoContect }
   */
  autoContect: {
    /** 联网重连, 默认true
     * 即因为网络原因断开后，将在网络连接后自动重新连接
     */
    onlineContect: true,

    /**
     * 心跳检测最大尝试次数
     * @default 0 永远尝试重新连接
     */
    @JsonProperty()
    max?: number = 0;

    /**
     * 心跳检测(时间ms) 0 为关闭心跳检测, 默认 3 * 1000 ms
     * 即因为意外情况断开时，间隔timeContect时间进行重新连接
     */
    timeContect = 3 * 1000,
  }
}

const easyWebSocketC = new EasyWebSocketC(options);
easyWebSocketC.open('ws://localhost:3000/socket').onOpen(() => {
  console.log('opened')
}).onError(err => {
  console.error(err)
}).onClose((event) => {
  console.log('close')
})

```