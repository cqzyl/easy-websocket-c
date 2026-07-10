import WebSocket, { WebSocketServer } from 'ws';

export const HEART_MESSAGE = 'heartMessage';

export type TestServerOptions = {
  port?: number;
  /** 连接建立时主动发送的消息 */
  replyOnConnect?: string | false;
  /** 是否回复 heartMessage */
  replyHeart?: boolean;
  /** 自定义心跳消息标识，默认 heartMessage */
  heartMessage?: string;
  /** 收到客户端消息时的回调 */
  onClientMessage?: (msg: string) => void;
};

export type TestServer = {
  port: number;
  close: () => Promise<void>;
};

export function createTestServer(options: TestServerOptions = {}): Promise<TestServer> {
  const wss = new WebSocketServer({ port: options.port ?? 0 });

  return new Promise((resolve, reject) => {
    wss.on('error', reject);

    wss.on('listening', () => {
      const address = wss.address();
      const port = typeof address === 'object' && address ? address.port : options.port!;

      wss.on('connection', (ws) => {
        if (options.replyOnConnect) {
          ws.send(options.replyOnConnect);
        }

        ws.on('message', (data) => {
          const msg = data.toString();
          options.onClientMessage?.(msg);

          const heartMsg = options.heartMessage ?? HEART_MESSAGE;
          if (msg === heartMsg) {
            if (options.replyHeart) {
              ws.send(heartMsg);
            }
            return;
          }

          ws.send(`echo:${msg}`);
        });
      });

      resolve({
        port,
        close: () => new Promise<void>((closeResolve, closeReject) => {
          wss.close((err) => (err ? closeReject(err) : closeResolve()));
        }),
      });
    });
  });
}
