import { expect } from 'chai';
import EasyWebSocketC from '../../src/modules/main';
import { createTestServer, HEART_MESSAGE } from './helpers/test-server';
import { createTracker, sleep, waitFor } from './helpers/utils';

describe('HeartContectOptions 参数与场景', () => {
  let servers: Array<{ close: () => Promise<void> }> = [];

  afterEach(async () => {
    await Promise.all(servers.splice(0).map((server) => server.close().catch(() => undefined)));
  });

  it('heart: false 不启用心跳', async () => {
    const server = await createTestServer({ replyOnConnect: false });
    servers.push(server);

    const tracker = createTracker();
    const socket = new EasyWebSocketC({
      autoContect: false,
      heart: false,
    });

    socket
      .onOpen(() => { tracker.openCount += 1; })
      .onHeartClose(() => { tracker.heartCloseCount += 1; });

    socket.open(`ws://127.0.0.1:${server.port}`);
    await waitFor('open', () => tracker.openCount === 1);
    await sleep(2000);

    expect(tracker.heartCloseCount).to.equal(0);
    socket.close();
  });

  it('waitTime 超时触发 onHeartClose', async () => {
    const server = await createTestServer({ replyOnConnect: false });
    servers.push(server);

    const tracker = createTracker();
    const socket = new EasyWebSocketC({
      autoContect: false,
      heart: {
        message: HEART_MESSAGE,
        waitTime: 1500,
        timeContect: 500,
      },
    });

    socket.onHeartClose(() => { tracker.heartCloseCount += 1; });
    socket.open(`ws://127.0.0.1:${server.port}`);
    await waitFor('open', () => socket.status === 'RUNNING');

    await waitFor('heart close', () => tracker.heartCloseCount > 0, 4000);
    expect(tracker.heartCloseCount).to.equal(1);
    socket.close();
  });

  it('waitTime: 0 关闭心跳超时检测', async () => {
    const server = await createTestServer({ replyOnConnect: false });
    servers.push(server);

    const tracker = createTracker();
    const socket = new EasyWebSocketC({
      autoContect: false,
      heart: {
        message: HEART_MESSAGE,
        waitTime: 0,
        timeContect: 500,
      },
    });

    socket.onHeartClose(() => { tracker.heartCloseCount += 1; });
    socket.open(`ws://127.0.0.1:${server.port}`);
    await waitFor('open', () => socket.status === 'RUNNING');
    await sleep(2500);

    expect(tracker.heartCloseCount).to.equal(0);
    socket.close();
  });

  it('服务端消息重置 waitTime', async () => {
    const server = await createTestServer({ replyOnConnect: 'pong-on-connect' });
    servers.push(server);

    const tracker = createTracker();
    const socket = new EasyWebSocketC({
      autoContect: false,
      heart: {
        message: HEART_MESSAGE,
        waitTime: 2500,
        timeContect: 400,
      },
    });

    socket.onHeartClose(() => { tracker.heartCloseCount += 1; });
    socket.open(`ws://127.0.0.1:${server.port}`);
    await waitFor('open', () => socket.status === 'RUNNING');
    await sleep(1500);

    expect(tracker.heartCloseCount).to.equal(0);
    socket.close();
  });

  it('服务端回复 heartMessage 重置 waitTime', async () => {
    const server = await createTestServer({ replyOnConnect: false, replyHeart: true });
    servers.push(server);

    const tracker = createTracker();
    const socket = new EasyWebSocketC({
      autoContect: false,
      heart: {
        message: HEART_MESSAGE,
        waitTime: 2000,
        timeContect: 500,
      },
    });

    socket.onHeartClose(() => { tracker.heartCloseCount += 1; });
    socket.open(`ws://127.0.0.1:${server.port}`);
    await waitFor('open', () => socket.status === 'RUNNING');
    await sleep(3500);

    expect(tracker.heartCloseCount).to.equal(0);
    socket.close();
  });

  it('isFilter: true 过滤心跳消息不触发 onMessage', async () => {
    const server = await createTestServer({ replyOnConnect: false, replyHeart: true });
    servers.push(server);

    const tracker = createTracker();
    const socket = new EasyWebSocketC({
      autoContect: false,
      heart: {
        message: HEART_MESSAGE,
        waitTime: 5000,
        timeContect: 400,
        isFilter: true,
      },
    });

    socket
      .onOpen(() => { tracker.openCount += 1; })
      .onMessage((ev) => {
        tracker.messageCount += 1;
        tracker.messages.push((ev as MessageEvent).data);
      });

    socket.open(`ws://127.0.0.1:${server.port}`);
    await waitFor('open', () => tracker.openCount === 1);
    await sleep(1200);

    expect(tracker.messageCount).to.equal(0);
    socket.close();
  });

  it('isFilter: false 心跳响应也触发 onMessage', async () => {
    const server = await createTestServer({ replyOnConnect: false, replyHeart: true });
    servers.push(server);

    const tracker = createTracker();
    const socket = new EasyWebSocketC({
      autoContect: false,
      heart: {
        message: HEART_MESSAGE,
        waitTime: 5000,
        timeContect: 400,
        isFilter: false,
      },
    });

    socket
      .onOpen(() => { tracker.openCount += 1; })
      .onMessage((ev) => {
        tracker.messageCount += 1;
        tracker.messages.push((ev as MessageEvent).data);
      });

    socket.open(`ws://127.0.0.1:${server.port}`);
    await waitFor('open', () => tracker.openCount === 1);
    await waitFor('heart message delivered', () => tracker.messageCount >= 1, 4000);

    expect(tracker.messages).to.include(HEART_MESSAGE);
    socket.close();
  });

  it('心跳超时后 autoContect 开启则自动重连', async () => {
    const server = await createTestServer({ replyOnConnect: false });
    servers.push(server);

    const tracker = createTracker();
    const socket = new EasyWebSocketC({
      autoContect: {
        max: 3,
        onlineContect: false,
        timeContect: 300,
        abdicationTime: 0,
      },
      heart: {
        message: HEART_MESSAGE,
        waitTime: 800,
        timeContect: 300,
      },
    });

    socket
      .onOpen(() => { tracker.openCount += 1; })
      .onHeartClose(() => { tracker.heartCloseCount += 1; });

    socket.open(`ws://127.0.0.1:${server.port}`);
    await waitFor('first open', () => tracker.openCount >= 1);
    await waitFor('heart close', () => tracker.heartCloseCount >= 1, 4000);
    await waitFor('reconnect open', () => tracker.openCount >= 2, 5000);

    expect(tracker.openCount).to.be.greaterThan(1);
    socket.close();
  });
});
