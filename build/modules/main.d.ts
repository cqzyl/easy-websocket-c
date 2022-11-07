import { EasyWebSocketCAttribute, ICallBack } from './attribute';
import { EasyWebSocketCOptions } from './options';
/** socket实体 */
export default class EasyWebSocketC extends EasyWebSocketCAttribute<EasyWebSocketC> {
    constructor(options?: EasyWebSocketCOptions);
    /**
     * 断网检测
     * 断网后自动清除 socket 实例
     */
    protected startOfflineWatch(): void;
    /** 停止断网检测重连功能 */
    protected stopOfflineWatch(): void;
    /** 启动联网检测 */
    protected startOnlineWatch(): void;
    /** 停止联网检测 */
    protected stopOnlineWatch(): void;
    /** 开始心跳检测 */
    protected startTimeWatch(): void;
    /** 初始化websocket连接 */
    protected initSocket(): void;
    /** 注册监听事件 */
    protected startListenEvent(): void;
    /** 停止监听事件 */
    protected stopListenEvent(): void;
    /** 等待中清除其他状态 */
    protected waittingClear(): void;
    /** 重连websocket */
    reopen(): void;
    /** 创建websocket连接 */
    open(url: string | URL, protocols: string | string[] | undefined, forceOpen?: true): this;
    /** Transmits data using the WebSocket connection. data can be a string, a Blob, an ArrayBuffer, or an ArrayBufferView. */
    send(data: string | ArrayBufferLike | Blob | ArrayBufferView): this;
    /** Closes the WebSocket connection, optionally using code as the the WebSocket connection close code and reason as the the WebSocket connection close reason. */
    close(code?: number, reason?: string, notClearListenEvent?: boolean): void;
    /**
     * Clear all fire metter who had bind except the network metter.
     */
    clearListenEvent(): void;
    /**
     * Fired when the socket is connected and when the network is connected
     */
    onOnline(listener: ICallBack<EasyWebSocketC>): this;
    /**
     * Fired when the socket is connected and when the network is disconnected
     */
    onOffline(listener: ICallBack<EasyWebSocketC>): this;
    /**
     * Fired when a connection with a WebSocket is opened. Also available via the onopen property.
     */
    onOpen(listener: ICallBack<EasyWebSocketC>): this;
    /**
     * Listen for messages
     * @descriptions Fired when data is received through a WebSocket. Also available via the onmessage property.
     */
    onMessage(listener: ICallBack<EasyWebSocketC>): this;
    /**
     * Fired when a connection with a WebSocket is closed. Also available via the onclose property
     */
    onClose(listener: ICallBack<EasyWebSocketC>): this;
    /**
     * Fired when a connection with a WebSocket has been closed because of an error, such as when some data couldn't be sent. Also available via the onerror property.
     */
    onError(listener: ICallBack<EasyWebSocketC>): this;
}
