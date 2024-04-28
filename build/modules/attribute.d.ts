import { EasyWebSocketCOptions } from './options';
/**
 * @description: 运行状态枚举
 */
export declare enum EasyWebSocketCStatus {
    /** 正在连接 */
    CONNECTING = 0,
    /** 正在运行 */
    RUNNING = 1,
    /** 正在等待重连 */
    WAITTING = 2,
    /** 运行终止 */
    CLOSED = 3
}
/** 网络状态枚举 */
export declare enum NetWorkStatusEnum {
    OFFLINE = 0,
    ONLINE = 1
}
export type ICallBack<T> = (this: T, ev: Event) => any;
/**
 * @description: 属性声明
 */
export declare class EasyWebSocketCAttribute<T> {
    /** 配置参数 */
    options: EasyWebSocketCOptions;
    /** socket 实例 */
    get socket(): WebSocket;
    /** 运行状态 */
    get status(): 'CONNECTING' | 'RUNNING' | 'WAITTING' | 'CLOSED';
    /** socket api参数 */
    protected socketOptions: {
        url: string | URL;
        protocols?: string | string[];
    };
    /** 断网后尝试重新连接 */
    protected get isRetryWhenOffline(): boolean;
    /** 实例 */
    protected webSocket: WebSocket;
    /** 运行状态值 */
    protected statusVal: EasyWebSocketCStatus;
    /** 网络状态值 */
    protected netWorkStatus: NetWorkStatusEnum;
    /** （停止）联网监听（abort实例） */
    protected onlineAbort?: AbortController;
    /** （停止）断网监听（abort实例） */
    protected offlineAbort?: AbortController;
    /** 联网监听回调 */
    protected onlineCallback: ICallBack<T>[];
    /** 断网监听回调 */
    protected offlineCallback: ICallBack<T>[];
    /** 心跳检测次数判断 */
    timeContectNum: number;
    /** 心跳检测最大次数 */
    protected get timeContectMaxNum(): number;
    /** 退避机制时间 */
    protected get abdicationTime(): number;
    /** 开启连接心跳检测 */
    protected get isTimeContect(): number;
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
