import { expect } from 'chai';
import EasyWebSocketC from '../../src/modules/main';
import { createTestServer } from './helpers/test-server';
import { createTracker, sleep, waitFor } from './helpers/utils';

describe('AutoContect 参数与场景', () => {
  let servers: Array<{ close: () => Promise<void> }> = [];

  afterEach(async () => {
    await Promise.all(servers.splice(0).map((server) => server.close().catch(() => undefined)));
  });

  it('autoContect: false 时不自动重连', async () => {
    const server = await createTestServer({ replyOnConnect: false });
    servers.push(server);

    const tracker = createTracker();
    const socket = new EasyWebSocketC({
      autoContect: false,
      heart: {
        message: 'heartMessage',
        waitTime: 800,
        timeContect: 300,
      },
    });

    socket
      .onOpen(() => { tracker.openCount += 1; })
      .onClose(() => { tracker.closeCount += 1; });

    socket.open(`ws://127.0.0.1:${server.port}`);
    await waitFor('open', () => tracker.openCount === 1);
    await sleep(2500);

    expect(tracker.openCount).to.equal(1);
    expect(tracker.closeCount).to.be.greaterThan(0);
    socket.close();
  });

  it('autoContect: true 使用默认 timeContect 重连', async function () {
    this.timeout(12000);

    const server = await createTestServer({ replyOnConnect: false });
    servers.push(server);

    const tracker = createTracker();
    const socket = new EasyWebSocketC({
      autoContect: true,
      heart: {
        message: 'heartMessage',
        waitTime: 600,
        timeContect: 300,
      },
    });

    socket
      .onOpen(() => { tracker.openCount += 1; })
      .onHeartClose(() => { tracker.heartCloseCount += 1; });

    socket.open(`ws://127.0.0.1:${server.port}`);
    await waitFor('first open', () => tracker.openCount >= 1);
    await waitFor('heart close', () => tracker.heartCloseCount >= 1, 4000);
    await waitFor('default reconnect', () => tracker.openCount >= 2, 8000);

    expect(tracker.openCount).to.be.greaterThan(1);
    socket.close();
  });

  it('timeContect: 0 关闭定时重连', async () => {
    const server = await createTestServer({ replyOnConnect: false });
    servers.push(server);

    const tracker = createTracker();
    const socket = new EasyWebSocketC({
      autoContect: {
        max: 5,
        onlineContect: false,
        timeContect: 0,
      },
      heart: {
        message: 'heartMessage',
        waitTime: 800,
        timeContect: 300,
      },
    });

    socket
      .onOpen(() => { tracker.openCount += 1; })
      .onHeartClose(() => { tracker.heartCloseCount += 1; });

    socket.open(`ws://127.0.0.1:${server.port}`);
    await waitFor('open', () => tracker.openCount === 1);
    await waitFor('heart close', () => tracker.heartCloseCount >= 1, 4000);
    await sleep(2000);

    expect(tracker.openCount).to.equal(1);
    socket.close();
  });

  it('max 限制重连次数', async () => {
    const tracker = createTracker();
    const socket = new EasyWebSocketC({
      autoContect: {
        max: 2,
        onlineContect: false,
        timeContect: 400,
        abdicationTime: 0,
      },
      heart: false,
    });

    socket.onClose(() => { tracker.closeCount += 1; });
    socket.open('ws://127.0.0.1:1');

    await waitFor('initial close', () => tracker.closeCount >= 1, 3000);
    await sleep(3500);

    const countAtLimit = tracker.closeCount;
    await sleep(2500);

    expect(countAtLimit).to.be.greaterThan(1);
    expect(tracker.closeCount).to.equal(countAtLimit);
    socket.close();
  });

  it('abdicationTime 递增重连等待时间', async () => {
    const closeTimes: number[] = [];
    const socket = new EasyWebSocketC({
      autoContect: {
        max: 5,
        onlineContect: false,
        timeContect: 500,
        abdicationTime: 800,
        abdicationTimeMax: 10000,
      },
      heart: false,
    });

    socket.onClose(() => { closeTimes.push(Date.now()); });
    socket.open('ws://127.0.0.1:1');

    await waitFor('third close', () => closeTimes.length >= 3, 12000);

    const delay1 = closeTimes[1] - closeTimes[0];
    const delay2 = closeTimes[2] - closeTimes[1];

    expect(delay1).to.be.within(400, 900);
    expect(delay2).to.be.within(1200, 1800);
    socket.close();
  });

  it('abdicationTimeMax 限制重连等待上限', async () => {
    const closeTimes: number[] = [];
    const socket = new EasyWebSocketC({
      autoContect: {
        max: 5,
        onlineContect: false,
        timeContect: 1000,
        abdicationTime: 5000,
        abdicationTimeMax: 2000,
      },
      heart: false,
    });

    socket.onClose(() => { closeTimes.push(Date.now()); });
    socket.open('ws://127.0.0.1:1');

    await waitFor('third close', () => closeTimes.length >= 3, 15000);

    const delay1 = closeTimes[1] - closeTimes[0];
    const delay2 = closeTimes[2] - closeTimes[1];

    expect(delay1).to.be.within(800, 1500);
    expect(delay2).to.be.within(1800, 2800);
    socket.close();
  });

  it('部分 autoContect 配置合并默认值', async () => {
    const server = await createTestServer();
    servers.push(server);

    const tracker = createTracker();
    const socket = new EasyWebSocketC({
      autoContect: {
        timeContect: 500,
        abdicationTime: 0,
      },
      heart: false,
    });

    socket.onOpen(() => { tracker.openCount += 1; });
    socket.open(`ws://127.0.0.1:59998`);

    await sleep(200);
    (socket as any).socketOptions.url = `ws://127.0.0.1:${server.port}`;
    await waitFor('reconnect', () => tracker.openCount >= 1, 5000);

    expect(tracker.openCount).to.be.greaterThan(0);
    socket.close();
  });

  it('首次连接失败后自动重连', async () => {
    const server = await createTestServer();
    servers.push(server);

    const tracker = createTracker();
    const socket = new EasyWebSocketC({
      autoContect: {
        max: 5,
        onlineContect: false,
        timeContect: 800,
        abdicationTime: 0,
      },
      heart: false,
    });

    socket.onOpen(() => { tracker.openCount += 1; });
    socket.open('ws://127.0.0.1:59998');

    await sleep(200);
    (socket as any).socketOptions.url = `ws://127.0.0.1:${server.port}`;
    await waitFor('reconnect open', () => tracker.openCount >= 1, 6000);

    expect(tracker.openCount).to.be.greaterThan(0);
    socket.close();
  });

  it('主动 close 后不自动重连', async () => {
    const server = await createTestServer({ replyOnConnect: false });
    servers.push(server);

    const tracker = createTracker();
    const socket = new EasyWebSocketC({
      autoContect: {
        timeContect: 500,
        onlineContect: false,
      },
      heart: false,
    });

    socket
      .onOpen(() => { tracker.openCount += 1; })
      .onClose(() => { tracker.closeCount += 1; });

    socket.open(`ws://127.0.0.1:${server.port}`);
    await waitFor('open', () => tracker.openCount === 1);
    socket.close();
    await waitFor('closed', () => socket.status === 'CLOSED');

    const closeCountAfterManual = tracker.closeCount;
    await sleep(1500);

    expect(tracker.openCount).to.equal(1);
    expect(tracker.closeCount).to.equal(closeCountAfterManual);
  });
});
