export declare class AutoContect {
    /** 联网重连 */
    onlineContect?: boolean;
    /**
     * 心跳检测(时间ms) 0 为关闭心跳检测
     * @description -- 注: 开启断网重连状态下, 断网后默认使用断网重连检测
     **/
    timeContect?: number;
}
/** 主对象参数声明 */
export declare class EasyWebSocketCOptions {
    /** 自动重连 */
    autoContect?: boolean | AutoContect;
    constructor(options?: Partial<EasyWebSocketCOptions>);
}
