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
/**
 * @description: 属性声明
 */
export declare class EasyWebSocketCAttribute {
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
    protected errorCallback: Array<(this: WebSocket, ev: Event) => any>;
    constructor(options?: EasyWebSocketCOptions);
}
