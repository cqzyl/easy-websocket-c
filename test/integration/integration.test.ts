import { expect } from 'chai';
import EasyWebSocketC from '../../src/modules/main';
import { createTestServer, HEART_MESSAGE } from './helpers/test-server';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function waitFor<T>(
  label: string,
  check: () => T | undefined | null | false,
  timeout = 5000,
  interval = 50,
): Promise<T> {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      const value = check();
      if (value) {
        clearInterval(timer);
        resolve(value as T);
        return;
      }

      if (Date.now() - start >= timeout) {
        clearInterval(timer);
        reject(new Error(`timeout waiting for ${label}`));
      }
    }, interval);
  });
}

describe('easy-websocket-c integration', () => {
  let servers: Array<{ close: () => Promise<void> }> = [];

  afterEach(async () => {
    await Promise.all(servers.splice(0).map((server) => server.close().catch(() => undefined)));
  });

  it('connects and reports RUNNING status', async () => {
    const server = await createTestServer();
    servers.push(server);

    const socket = new EasyWebSocketC();
    socket.open(`ws://127.0.0.1:${server.port}`);

    await waitFor('open', () => socket.status === 'RUNNING');
    expect(socket.status).to.equal('RUNNING');

    socket.close();
    await waitFor('closed', () => socket.status === 'CLOSED');
  });

  it('triggers onHeartClose when waitTime expires without server messages', async () => {
    const server = await createTestServer({ replyOnConnect: false });
    servers.push(server);

    let heartCloseCount = 0;

    const socket = new EasyWebSocketC({
      autoContect: false,
      heart: {
        message: HEART_MESSAGE,
        waitTime: 1500,
        timeContect: 500,
      },
    });

    socket.onHeartClose(() => {
      heartCloseCount += 1;
    });

    socket.open(`ws://127.0.0.1:${server.port}`);
    await waitFor('open', () => socket.status === 'RUNNING');

    await waitFor('heart close', () => heartCloseCount > 0, 4000);
    expect(heartCloseCount).to.equal(1);

    socket.close();
    await waitFor('closed', () => socket.status === 'CLOSED');
  });

  it('resets heart timeout when server sends messages', async () => {
    const server = await createTestServer({ replyOnConnect: 'pong-on-connect' });
    servers.push(server);

    let heartCloseCount = 0;

    const socket = new EasyWebSocketC({
      autoContect: false,
      heart: {
        message: HEART_MESSAGE,
        waitTime: 2500,
        timeContect: 400,
      },
    });

    socket.onHeartClose(() => {
      heartCloseCount += 1;
    });

    socket.open(`ws://127.0.0.1:${server.port}`);
    await waitFor('open', () => socket.status === 'RUNNING');

    await sleep(1500);
    expect(heartCloseCount).to.equal(0);

    socket.close();
    await waitFor('closed', () => socket.status === 'CLOSED');
  });

  it('auto reconnects after heart timeout when autoContect is enabled', async () => {
    const server = await createTestServer({ replyOnConnect: false });
    servers.push(server);

    let heartCloseCount = 0;
    let openCount = 0;

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

    socket.onOpen(() => {
      openCount += 1;
    }).onHeartClose(() => {
      heartCloseCount += 1;
    });

    socket.open(`ws://127.0.0.1:${server.port}`);

    await waitFor('first open', () => openCount >= 1);
    await waitFor('heart close', () => heartCloseCount >= 1, 4000);
    await waitFor('reconnect open', () => openCount >= 2, 5000);

    expect(heartCloseCount).to.be.greaterThan(0);
    expect(openCount).to.be.greaterThan(1);

    socket.close();
  });

  it('does not auto reconnect when autoContect is false', async () => {
    const server = await createTestServer({ replyOnConnect: false });
    servers.push(server);

    let openCount = 0;
    let closeCount = 0;

    const socket = new EasyWebSocketC({
      autoContect: false,
      heart: {
        message: HEART_MESSAGE,
        waitTime: 800,
        timeContect: 300,
      },
    });

    socket.onOpen(() => {
      openCount += 1;
    }).onClose(() => {
      closeCount += 1;
    });

    socket.open(`ws://127.0.0.1:${server.port}`);
    await waitFor('open', () => openCount === 1);

    await sleep(2500);

    expect(openCount).to.equal(1);
    expect(closeCount).to.be.greaterThan(0);

    socket.close();
  });

  it('retries after first connection failure', async () => {
    const server = await createTestServer();
    servers.push(server);

    let openCount = 0;
    const wrongPort = 59998;

    const socket = new EasyWebSocketC({
      autoContect: {
        max: 5,
        onlineContect: false,
        timeContect: 800,
        abdicationTime: 0,
      },
      heart: false,
    });

    socket.onOpen(() => {
      openCount += 1;
    });

    socket.open(`ws://127.0.0.1:${wrongPort}`);

    await sleep(200);
    (socket as any).socketOptions.url = `ws://127.0.0.1:${server.port}`;

    await waitFor('reconnect open', () => openCount >= 1, 6000);
    expect(openCount).to.be.greaterThan(0);

    socket.close();
  });

  it('respects abdicationTimeMax for reconnect delay', async () => {
    let closeCount = 0;
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

    socket.onClose(() => {
      closeCount += 1;
      closeTimes.push(Date.now());
    });

    socket.open('ws://127.0.0.1:1');

    await waitFor('third close for delay sample', () => closeCount >= 3, 15000);

    const delay1 = closeTimes[1] - closeTimes[0];
    const delay2 = closeTimes[2] - closeTimes[1];

    expect(delay1).to.be.within(800, 1500);
    expect(delay2).to.be.within(1800, 2800);

    socket.close();
  });
});
