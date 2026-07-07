# easy-websocket-c

> 用于简化 WebSocket 操作的 TypeScript 库  
> 在原生 WebSocket 基础上增加了**断线自动重连**、**联网/断网检测**、**心跳保活**等功能

```bash
npm i easy-websocket-c
```

## 一、使用示例

### 简单用法

```javascript
import EasyWebSocketC from 'easy-websocket-c';

const ws = new EasyWebSocketC();

ws.open('ws://localhost:3000/socket')
  .onOpen(() => {
    console.log('opened');
  })
  .onMessage((ev) => {
    console.log('message', ev.data);
  })
  .onError((err) => {
    console.error(err);
  })
  .onClose((event) => {
    console.log('close', event);
  });
```

### 全配置写法

```javascript
import EasyWebSocketC from 'easy-websocket-c';

const ws = new EasyWebSocketC({
  // 自动重连：true | false | AutoContect 对象
  autoContect: {
    onlineContect: true,            // 断网后等待联网再重连，默认 true
    max: 0,                         // 最大重连次数，0 表示无限重试，默认 0
    timeContect: 3 * 1000,          // 断线后等待多久再重连（ms），0 为关闭，默认 3000
    abdicationTime: 0,              // 退避增量（ms），默认 0
    abdicationTimeMax: 60 * 1000,   // 重连最大等待时间（ms），默认 60000
  },
  // 心跳保活：false | HeartContectOptions 对象
  heart: {
    message: 'ping',              // 心跳消息内容（必填）
    isFilter: true,                 // 是否在 onMessage 中过滤心跳消息，默认 true
    timeContect: 5 * 1000,          // 心跳发送间隔（ms），默认 5000
    waitTime: 5 * 1000,             // 无服务端消息最长等待（ms），默认 5000
  },
});

ws.open('ws://localhost:3000/socket')
  .onOpen(() => console.log('opened'))
  .onHeartClose((ev) => console.warn('心跳异常断开', ev))
  .onOffline(() => console.warn('网络断开'))
  .onOnline(() => console.warn('网络恢复'));
```

### 关闭自动重连、仅启用心跳

```javascript
const ws = new EasyWebSocketC({
  autoContect: false,
  heart: {
    message: 'heartMessage',
    waitTime: 120 * 1000,
    timeContect: 50 * 1000,
  },
});
```

## 二、配置说明

### EasyWebSocketCOptions

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `autoContect` | `boolean \| AutoContect` | `true` | 自动重连。`true` 使用默认配置，`false` 关闭 |
| `heart` | `false \| HeartContectOptions` | `false` | 心跳保活。`false` 表示不启用 |

### AutoContect（断线自动重连）

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `onlineContect` | `boolean` | `true` | 断网后进入 `WAITTING`，联网后自动 `reopen`。建议保持开启 |
| `max` | `number` | `0` | 意外断线后的最大重连次数。`0` 表示无限重试 |
| `timeContect` | `number` | `3000` | 意外断线后的初始等待时间（ms）。`0` 关闭定时重连 |
| `abdicationTime` | `number` | `0` | 退避增量（ms），每次重连失败后等待时间递增 |
| `abdicationTimeMax` | `number` | `60000` | 重连等待时间上限（ms） |

**重连等待时间：**

```
实际等待 = min(timeContect + 已重试次数 × abdicationTime, abdicationTimeMax)
```

示例：`timeContect = 3000`、`abdicationTime = 2000`、`abdicationTimeMax = 60000` 时，第 30 次重连等待 `min(3000 + 30 × 2000, 60000) = 60000` ms。

**两条重连路径（互不冲突）：**

| 场景 | 触发方式 |
| --- | --- |
| 意外断线 / 心跳超时 | `close` 后按 `timeContect` 定时 `reopen` |
| 浏览器断网 | `onOffline` → 等待；`onOnline` → `reopen`（需 `onlineContect: true`） |

### HeartContectOptions（心跳保活）

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `message` | `string` | — | 心跳消息内容（必填） |
| `isFilter` | `boolean` | `true` | 与 `message` 相同的消息不触发 `onMessage` |
| `timeContect` | `number` | `5000` | 心跳发送间隔（ms）。`0` 不发送 |
| `waitTime` | `number` | `5000` | 无服务端消息最长等待（ms）。`0` 关闭超时检测 |

**心跳超时逻辑：**

- 连接成功或收到**任意** WebSocket 消息时，重置 `waitTime` 倒计时
- 倒计时内无新消息 → 触发 `onHeartClose` → 主动 `close` → 若开启 `autoContect` 则走自动重连
- `timeContect` 仅控制发送频率，**不参与**超时计算

> 注意：若服务端有非心跳推送，也会刷新 `waitTime`。如需「仅心跳响应才重置」，需自行在业务层处理。

## 三、实例属性

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `socket` | `WebSocket` | 当前 WebSocket 实例 |
| `status` | `'CONNECTING' \| 'RUNNING' \| 'WAITTING' \| 'CLOSED'` | 运行状态 |

| 状态 | 含义 |
| --- | --- |
| `CONNECTING` | 正在建立连接 |
| `RUNNING` | 连接正常 |
| `WAITTING` | 等待重连（断网或定时重连前） |
| `CLOSED` | 主动关闭，不再重连 |

## 四、Methods

| 方法名 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| `open` | 创建连接 | `url, protocols?, forceOpen?` | `this` |
| `reopen` | 用上次 `open` 参数重连 | — | — |
| `send` | 发送数据 | `data` | `this` |
| `close` | 主动关闭 | `notClearListenEvent?, code?, reason?` | — |
| `clearListenEvent` | 清除事件回调（保留网络监听） | — | — |

**参数说明：**

- `open(..., forceOpen?: true)`：已有连接时强制关闭并重建
- `close(notClearListenEvent?)`：默认清除所有回调；传 `true` 保留已注册的 `onOpen` / `onMessage` 等

```javascript
ws.open('ws://localhost:3000/socket');
ws.send('hello');
ws.reopen();
ws.close();                              // 主动关闭，清除回调
ws.close(false, 1000, 'custom reason');  // 带关闭码和原因
```

## 五、Events

所有事件监听均支持链式调用，返回 `this`。

| 方法名 | 说明 |
| --- | --- |
| `onOpen` | 连接成功 |
| `onMessage` | 收到消息（心跳可被 `heart.isFilter` 过滤） |
| `onClose` | 连接关闭 |
| `onError` | 发生错误 |
| `onOnline` | 浏览器检测到网络恢复 |
| `onOffline` | 浏览器检测到网络断开 |
| `onHeartClose` | 心跳 `waitTime` 超时，连接被主动断开 |

```javascript
ws.onOpen((ev) => { /* ... */ })
  .onMessage((ev) => { /* ... */ })
  .onClose((ev) => { /* ... */ })
  .onError((ev) => { /* ... */ })
  .onOnline((ev) => { /* ... */ })
  .onOffline((ev) => { /* ... */ })
  .onHeartClose((ev) => { /* ... */ });
```

### TypeScript 类型

主入口仅导出默认类。配置类型可从编译产物引入：

```typescript
import EasyWebSocketC from 'easy-websocket-c';
import type { EasyWebSocketCOptions, AutoContect, HeartContectOptions } from 'easy-websocket-c/build/modules/options';
```

## 七、生命周期图示

![easy-websocket-c 生命周期](./docs/websocket.svg)
