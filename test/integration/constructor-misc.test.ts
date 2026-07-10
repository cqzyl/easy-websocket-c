import { expect } from 'chai';
import EasyWebSocketC from '../../src/modules/main';
import { createTestServer } from './helpers/test-server';
import { createTracker, sleep, waitFor } from './helpers/utils';

describe('构造参数与其它场景', () => {
  let servers: Array<{ close: () => Promise<void> }> = [];

  afterEach(async () => {
    await Promise.all(servers.splice(0).map((server) => server.close().catch(() => undefined)));
  });

  it('无参构造使用默认 autoContect: true、heart: false', async () => {
    const socket = new EasyWebSocketC();

    expect((socket as any).options.autoContect).to.equal(true);
    expect((socket as any).options.heart).to.equal(false);
    expect(socket.status).to.equal('CLOSED');
  });

  it('heart 部分配置合并默认值', async () => {
    const server = await createTestServer({ replyOnConnect: false, replyHeart: true });
    servers.push(server);

    const tracker = createTracker();
    const socket = new EasyWebSocketC({
      autoContect: false,
      heart: {
        message: 'heartMessage',
        waitTime: 5000,
      },
    });

    const heartOptions = (socket as any).options.heart;
    expect(heartOptions.isFilter).to.equal(true);
    expect(heartOptions.timeContect).to.equal(5000);

    socket
      .onOpen(() => { tracker.openCount += 1; })
      .onMessage(() => { tracker.messageCount += 1; });

    socket.open(`ws://127.0.0.1:${server.port}`);
    await waitFor('open', () => tracker.openCount === 1);
    await sleep(1200);

    expect(tracker.messageCount).to.equal(0);
    socket.close();
  });

  it('heart.timeContect 控制心跳发送间隔', async () => {
    const heartReceived: string[] = [];
    const server = await createTestServer({
      replyOnConnect: false,
      onClientMessage: (msg) => {
        if (msg === 'heartMessage') {
          heartReceived.push(msg);
        }
      },
    });
    servers.push(server);

    const socket = new EasyWebSocketC({
      autoContect: false,
      heart: {
        message: 'heartMessage',
        waitTime: 0,
        timeContect: 400,
      },
    });

    socket.open(`ws://127.0.0.1:${server.port}`);
    await waitFor('open', () => socket.status === 'RUNNING');
    await sleep(1100);

    expect(heartReceived.length).to.be.at.least(2);
    socket.close();
  });

  it('自定义 heart.message 可正常识别', async () => {
    const customHeart = 'customBeat';
    const heartReceived: string[] = [];
    const server = await createTestServer({
      replyOnConnect: false,
      replyHeart: true,
      heartMessage: customHeart,
      onClientMessage: (msg) => {
        if (msg === customHeart) {
          heartReceived.push(msg);
        }
      },
    });
    servers.push(server);

    const tracker = createTracker();
    const socket = new EasyWebSocketC({
      autoContect: false,
      heart: {
        message: customHeart,
        waitTime: 5000,
        timeContect: 400,
        isFilter: true,
      },
    });

    socket
      .onOpen(() => { tracker.openCount += 1; })
      .onHeartClose(() => { tracker.heartCloseCount += 1; });

    socket.open(`ws://127.0.0.1:${server.port}`);
    await waitFor('open', () => tracker.openCount === 1);
    await sleep(1200);

    expect(heartReceived.length).to.be.at.least(1);
    expect(tracker.heartCloseCount).to.equal(0);
    socket.close();
  });

  it('连接失败触发 onError', async () => {
    const tracker = createTracker();
    const socket = new EasyWebSocketC({
      autoContect: false,
      heart: false,
    });

    socket.onError(() => { tracker.errorCount += 1; });
    socket.open('ws://127.0.0.1:59997');

    await waitFor('error', () => tracker.errorCount >= 1, 5000);
    expect(tracker.errorCount).to.be.greaterThan(0);
    socket.close();
  });

  it('open 支持 protocols 参数', async () => {
    const server = await createTestServer();
    servers.push(server);

    const tracker = createTracker();
    const socket = new EasyWebSocketC({ autoContect: false, heart: false });

    socket.onOpen(() => { tracker.openCount += 1; });
    socket.open(`ws://127.0.0.1:${server.port}`, 'chat');
    await waitFor('open', () => tracker.openCount === 1);

    expect((socket as any).socketOptions.protocols).to.equal('chat');
    socket.close();
  });
});
