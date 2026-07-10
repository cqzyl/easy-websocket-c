import { expect } from 'chai';
import { dispatchNetworkEvent } from './setup-env';
import EasyWebSocketC from '../../src/modules/main';
import { createTestServer } from './helpers/test-server';
import { createTracker, sleep, waitFor } from './helpers/utils';

describe('网络与 API 场景', () => {
  let servers: Array<{ close: () => Promise<void> }> = [];

  afterEach(async () => {
    await Promise.all(servers.splice(0).map((server) => server.close().catch(() => undefined)));
  });

  it('连接成功与 RUNNING 状态', async () => {
    const server = await createTestServer();
    servers.push(server);

    const socket = new EasyWebSocketC();
    socket.open(`ws://127.0.0.1:${server.port}`);

    await waitFor('open', () => socket.status === 'RUNNING');
    expect(socket.status).to.equal('RUNNING');
    expect(socket.socket).to.exist;

    socket.close();
    await waitFor('closed', () => socket.status === 'CLOSED');
  });

  it('onlineContect: true 断网后 WAITTING，联网后重连', async () => {
    const server = await createTestServer();
    servers.push(server);

    const tracker = createTracker();
    const socket = new EasyWebSocketC({
      autoContect: {
        onlineContect: true,
        timeContect: 5000,
      },
      heart: false,
    });

    socket
      .onOpen(() => { tracker.openCount += 1; })
      .onOffline(() => { tracker.offlineCount += 1; })
      .onOnline(() => { tracker.onlineCount += 1; });

    socket.open(`ws://127.0.0.1:${server.port}`);
    await waitFor('open', () => tracker.openCount === 1);

    dispatchNetworkEvent('offline');
    await waitFor('offline', () => tracker.offlineCount === 1);
    await waitFor('waiting', () => socket.status === 'WAITTING');

    dispatchNetworkEvent('online');
    await waitFor('online', () => tracker.onlineCount === 1);
    await waitFor('reopen', () => tracker.openCount >= 2, 6000);

    expect(tracker.openCount).to.be.greaterThan(1);
    socket.close();
  });

  it('onlineContect: false 断网后直接关闭', async () => {
    const server = await createTestServer();
    servers.push(server);

    const tracker = createTracker();
    const socket = new EasyWebSocketC({
      autoContect: {
        onlineContect: false,
        timeContect: 5000,
      },
      heart: false,
    });

    socket
      .onOpen(() => { tracker.openCount += 1; })
      .onOffline(() => { tracker.offlineCount += 1; })
      .onClose(() => { tracker.closeCount += 1; });

    socket.open(`ws://127.0.0.1:${server.port}`);
    await waitFor('open', () => tracker.openCount === 1);

    dispatchNetworkEvent('offline');
    await waitFor('offline', () => tracker.offlineCount === 1);
    await waitFor('closed', () => socket.status === 'CLOSED');

    await sleep(1500);
    expect(tracker.openCount).to.equal(1);
    socket.close();
  });

  it('已有连接时 open 不会重复建立', async () => {
    const server = await createTestServer();
    servers.push(server);

    const tracker = createTracker();
    const socket = new EasyWebSocketC({ autoContect: false, heart: false });

    socket.onOpen(() => { tracker.openCount += 1; });
    socket.open(`ws://127.0.0.1:${server.port}`);
    await waitFor('open', () => tracker.openCount === 1);

    socket.open(`ws://127.0.0.1:${server.port}`);
    await sleep(500);

    expect(tracker.openCount).to.equal(1);
    socket.close();
  });

  it('forceOpen 强制重建连接', async () => {
    const server = await createTestServer();
    servers.push(server);

    const tracker = createTracker();
    const socket = new EasyWebSocketC({ autoContect: false, heart: false });

    socket.onOpen(() => { tracker.openCount += 1; });
    socket.open(`ws://127.0.0.1:${server.port}`);
    await waitFor('first open', () => tracker.openCount === 1);

    socket.open(`ws://127.0.0.1:${server.port}`, undefined, true);
    await waitFor('force reopen', () => tracker.openCount >= 2, 5000);

    expect(tracker.openCount).to.be.greaterThan(1);
    socket.close();
  });

  it('send 可发送并收到 echo', async () => {
    const server = await createTestServer();
    servers.push(server);

    const tracker = createTracker();
    const socket = new EasyWebSocketC({ autoContect: false, heart: false });

    socket
      .onOpen(() => { tracker.openCount += 1; })
      .onMessage((ev) => {
        tracker.messageCount += 1;
        tracker.messages.push((ev as MessageEvent).data);
      });

    socket.open(`ws://127.0.0.1:${server.port}`);
    await waitFor('open', () => tracker.openCount === 1);

    socket.send('hello');
    await waitFor('echo', () => tracker.messageCount >= 1, 4000);

    expect(tracker.messages[0]).to.equal('echo:hello');
    socket.close();
  });

  it('reopen 使用上次 open 参数重连', async () => {
    const server = await createTestServer();
    servers.push(server);

    const tracker = createTracker();
    const socket = new EasyWebSocketC({ autoContect: false, heart: false });

    socket.onOpen(() => { tracker.openCount += 1; });
    socket.open(`ws://127.0.0.1:${server.port}`);
    await waitFor('open', () => tracker.openCount === 1);

    socket.close(true, 1000, 'test reopen');
    await waitFor('closed', () => socket.status === 'CLOSED');

    socket.reopen();
    await waitFor('reopened', () => socket.status === 'RUNNING', 5000);

    expect(tracker.openCount).to.be.greaterThan(1);
    socket.close();
  });

  it('close(true) 保留事件回调', async () => {
    const server = await createTestServer();
    servers.push(server);

    const tracker = createTracker();
    const socket = new EasyWebSocketC({ autoContect: false, heart: false });

    socket.onOpen(() => { tracker.openCount += 1; });
    socket.open(`ws://127.0.0.1:${server.port}`);
    await waitFor('first open', () => tracker.openCount === 1);

    socket.close(true);
    await waitFor('closed', () => socket.status === 'CLOSED');

    socket.open(`ws://127.0.0.1:${server.port}`);
    await waitFor('second open with preserved listener', () => tracker.openCount >= 2, 5000);

    expect(tracker.openCount).to.equal(2);
    socket.close();
  });

  it('clearListenEvent 清除回调', async () => {
    const server = await createTestServer();
    servers.push(server);

    const tracker = createTracker();
    const socket = new EasyWebSocketC({ autoContect: false, heart: false });

    socket.onOpen(() => { tracker.openCount += 1; });
    socket.open(`ws://127.0.0.1:${server.port}`);
    await waitFor('open', () => tracker.openCount === 1);

    socket.clearListenEvent();
    socket.close(true);
    socket.open(`ws://127.0.0.1:${server.port}`);
    await sleep(800);

    expect(tracker.openCount).to.equal(1);
    socket.close();
  });
});
