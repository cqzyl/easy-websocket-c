import { EasyWebSocketCOptions } from './options';
/**
 * @description: 运行状态枚举
 */
export declare enum EasyWebSocketCStatus {
    /** 正在运行 */
    RUNNING = 0,
    /** 正在等待重连 */
    WAITTING = 1,
    /** 运行终止 */
    CLOSED = 2
}
export declare type ICallBack<T> = (this: T, ev: Event) => any;
/**
 * @description: 属性声明
 */
export declare class EasyWebSocketCAttribute<T> {
    /** 配置参数 */
    options: EasyWebSocketCOptions;
    /** socket 实例 */
    get socket(): WebSocket;
    /** 运行状态 */
    get status(): string;
    /** socket api参数 */
    protected socketOptions: {
        url: string | URL;
        protocols?: string | string[];
    };
    /** 断网后尝试重新连接 */
    protected get isRetryWhenOffline(): boolean;
    /** 重连等待计时器 */
    protected retryTimeCloseKey: number;
    /** 实例 */
    protected webSocket: WebSocket;
    /** 运行状态值 */
    protected statusVal: EasyWebSocketCStatus;
    /** （停止）联网监听（abort实例） */
    protected onlineAbort?: AbortController;
    /** （停止）断网监听（abort实例） */
    protected offlineAbort?: AbortController;
    /** 错误监听（abort实例） */
    protected errorController?: AbortController;
    /** 错误回调列表 */
    protected errorCallback: ICallBack<T>[];
    /** open回调列表 */
    protected openCallback: ICallBack<T>[];
    /** message监听（abort实例） */
    protected messageController?: AbortController;
    /** message回调列表 */
    protected messageCallback: ICallBack<T>[];
    /** close监听（abort实例） */
    protected closeController?: AbortController;
    /** close回调列表 */
    protected closeCallback: ICallBack<T>[];
    constructor(options?: EasyWebSocketCOptions);
}
