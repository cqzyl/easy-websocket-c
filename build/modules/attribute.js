"use strict";
/*
 * @Description: 属性
 * @Author: ChenQiang
 * @Date: 2022-10-08 17:16:04
 * @LastEditors: ChenQiang
 * @LastEditTime: 2024-04-24 17:15:46
 * @FilePath: \src\modules\attribute.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EasyWebSocketCAttribute = exports.NetWorkStatusEnum = exports.EasyWebSocketCStatus = void 0;
const mapper_json_c_1 = require("mapper-json-c");
const options_1 = require("./options");
const baseAutoContect = new options_1.AutoContect();
/**
 * @description: 运行状态枚举
 */
var EasyWebSocketCStatus;
(function (EasyWebSocketCStatus) {
    /** 正在连接 */
    EasyWebSocketCStatus[EasyWebSocketCStatus["CONNECTING"] = 0] = "CONNECTING";
    /** 正在运行 */
    EasyWebSocketCStatus[EasyWebSocketCStatus["RUNNING"] = 1] = "RUNNING";
    /** 正在等待重连 */
    EasyWebSocketCStatus[EasyWebSocketCStatus["WAITTING"] = 2] = "WAITTING";
    /** 运行终止 */
    EasyWebSocketCStatus[EasyWebSocketCStatus["CLOSED"] = 3] = "CLOSED";
})(EasyWebSocketCStatus = exports.EasyWebSocketCStatus || (exports.EasyWebSocketCStatus = {}));
/** 网络状态枚举 */
var NetWorkStatusEnum;
(function (NetWorkStatusEnum) {
    NetWorkStatusEnum[NetWorkStatusEnum["OFFLINE"] = 0] = "OFFLINE";
    NetWorkStatusEnum[NetWorkStatusEnum["ONLINE"] = 1] = "ONLINE";
})(NetWorkStatusEnum = exports.NetWorkStatusEnum || (exports.NetWorkStatusEnum = {}));
/**
 * @description: 属性声明
 */
class EasyWebSocketCAttribute {
    /** 配置参数 */
    options;
    /** socket 实例 */
    get socket() {
        return this.webSocket;
    }
    /** 运行状态 */
    get status() {
        return EasyWebSocketCStatus[this.statusVal];
    }
    /** socket api参数 */
    socketOptions = {
        url: '',
    };
    /** 断网后尝试重新连接 */
    get isRetryWhenOffline() {
        const { autoContect } = this.options;
        return autoContect === true || (typeof autoContect === 'object' && autoContect.onlineContect);
    }
    /** 实例 */
    webSocket;
    /** 运行状态值 */
    statusVal = EasyWebSocketCStatus.CLOSED;
    /* ****************** 网络 ****** start ****************** */
    /** 网络状态值 */
    netWorkStatus = NetWorkStatusEnum.ONLINE;
    /** （停止）联网监听（abort实例） */
    onlineAbort;
    /** （停止）断网监听（abort实例） */
    offlineAbort;
    /** 联网监听回调 */
    onlineCallback = [];
    /** 断网监听回调 */
    offlineCallback = [];
    /* ****************** 网络 ****** start ****************** */
    /* ****************** 心跳检测 ****** start ****************** */
    /** 心跳检测次数判断 */
    timeContectNum = 0;
    /** 心跳检测最大次数 */
    get timeContectMaxNum() {
        const { autoContect } = this.options;
        if (!autoContect) {
            return -1;
        }
        if (autoContect === true) {
            return baseAutoContect.max;
        }
        return autoContect.max;
    }
    /** 开启连接心跳检测 */
    get isTimeContect() {
        const { autoContect } = this.options;
        return autoContect === true ? baseAutoContect.timeContect : (typeof autoContect === 'object' && autoContect.timeContect);
    }
    /* ****************** 心跳检测 ****** end ****************** */
    /* ****************** websocket 错误处理 ****** start ****************** */
    /** 错误监听（abort实例） */
    errorController;
    /** 错误回调列表 */
    errorCallback = [];
    /* ****************** websocket 错误处理 ****** end   ****************** */
    /* ****************** websocket open 事件 ****** start ****************** */
    /** open回调列表 */
    openCallback = [];
    /* ****************** websocket open 事件 ****** end   ****************** */
    /* ****************** websocket message 事件 ****** start ****************** */
    /** message监听（abort实例） */
    messageController;
    /** message回调列表 */
    messageCallback = [];
    /* ****************** websocket message 事件 ****** end   ****************** */
    /* ****************** websocket close 事件 ****** start ****************** */
    /** close监听（abort实例） */
    closeController;
    /** close回调列表 */
    closeCallback = [];
    /* ****************** websocket close 事件 ****** end   ****************** */
    constructor(options) {
        this.options = (0, mapper_json_c_1.mapperJsonC)(options, options_1.EasyWebSocketCOptions);
        console.log(options, JSON.stringify(this.options));
    }
}
exports.EasyWebSocketCAttribute = EasyWebSocketCAttribute;
//# sourceMappingURL=attribute.js.map