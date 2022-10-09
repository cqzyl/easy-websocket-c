import { EasyWebSocketCAttribute } from './attribute';
import { EasyWebSocketCOptions } from './options';
/** socket实体 */
export default class EasyWebSocketC extends EasyWebSocketCAttribute {
    constructor(options?: EasyWebSocketCOptions);
    /**
     * 断网检测
     * 断网后自动清除 socket 实例
     */
    protected startOfflineWatch(): void;
    /** 启动联网检测 */
    protected startOnlineWatch(): void;
    /** 停止断网检测重连功能 */
    protected stopOfflineWatch(): void;
    /** 启动Error监听 */
    protected startErrorWatch(): void;
    /** 初始化websocket连接 */
    protected initSocket(): void;
    /** 创建websocket连接 */
    open(url: string | URL, protocols?: string | string[]): this;
    /** Transmits data using the WebSocket connection. data can be a string, a Blob, an ArrayBuffer, or an ArrayBufferView. */
    send(data: string | ArrayBufferLike | Blob | ArrayBufferView): this;
    /** Closes the WebSocket connection, optionally using code as the the WebSocket connection close code and reason as the the WebSocket connection close reason. */
    close(code?: number, reason?: string): void;
    /**
     * Fired when a connection with a WebSocket is opened. Also available via the onopen property.
     * @param {function} listener
     * @param {boolean} options
     */
    onOpen(listener: (this: WebSocket, ev: Event) => any, options?: boolean | AddEventListenerOptions): this;
    /**
     * Listen for messages
     * @descriptions Fired when data is received through a WebSocket. Also available via the onmessage property.
     * @param {function} listener
     * @param {boolean} options
     */
    onMessage(listener: (this: WebSocket, ev: MessageEvent) => any, options?: boolean | AddEventListenerOptions): this;
    /**
     * Fired when a connection with a WebSocket is closed. Also available via the onclose property
     * @param {function} listener
     * @param {boolean} options
     */
    onClose(listener: (this: WebSocket, ev: Event) => any, options?: boolean | AddEventListenerOptions): this;
    /**
     * Fired when a connection with a WebSocket has been closed because of an error, such as when some data couldn't be sent. Also available via the onerror property.
     * @param {function} listener
     * @param {boolean} options
     */
    onError(listener: (this: WebSocket, ev: Event) => any): this;
}
