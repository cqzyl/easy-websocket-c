"use strict";
/*
 * @Description: 属性
 * @Author: ChenQiang
 * @Date: 2022-10-08 17:16:04
 * @LastEditors: ChenQiang
 * @LastEditTime: 2024-04-28 11:47:24
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
    /** socket 实例 */
    get socket() {
        return this.webSocket;
    }
    /** 运行状态 */
    get status() {
        return EasyWebSocketCStatus[this.statusVal];
    }
    /** 断网后尝试重新连接 */
    get isRetryWhenOffline() {
        const { autoContect } = this.options;
        return autoContect === true || (typeof autoContect === 'object' && autoContect.onlineContect);
    }
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
    /** 退避机制时间 */
    get abdicationTime() {
        const { autoContect } = this.options;
        if (!autoContect) {
            return 0;
        }
        if (autoContect === true) {
            return baseAutoContect.abdicationTime;
        }
        return Math.max(autoContect.abdicationTime || 0, 0);
    }
    /** 开启连接心跳检测 */
    get isTimeContect() {
        const { autoContect } = this.options;
        return autoContect === true ? baseAutoContect.timeContect : (typeof autoContect === 'object' && autoContect.timeContect);
    }
    /* ****************** websocket close 事件 ****** end   ****************** */
    constructor(options) {
        /** socket api参数 */
        this.socketOptions = {
            url: '',
        };
        /** 运行状态值 */
        this.statusVal = EasyWebSocketCStatus.CLOSED;
        /* ****************** 网络 ****** start ****************** */
        /** 网络状态值 */
        this.netWorkStatus = NetWorkStatusEnum.ONLINE;
        /** 联网监听回调 */
        this.onlineCallback = [];
        /** 断网监听回调 */
        this.offlineCallback = [];
        /* ****************** 网络 ****** start ****************** */
        /* ****************** 心跳检测 ****** start ****************** */
        /** 心跳检测次数判断 */
        this.timeContectNum = 0;
        /** 错误回调列表 */
        this.errorCallback = [];
        /* ****************** websocket 错误处理 ****** end   ****************** */
        /* ****************** websocket open 事件 ****** start ****************** */
        /** open回调列表 */
        this.openCallback = [];
        /** message回调列表 */
        this.messageCallback = [];
        /** close回调列表 */
        this.closeCallback = [];
        this.options = (0, mapper_json_c_1.mapperJsonC)(options, options_1.EasyWebSocketCOptions);
        console.log(options, JSON.stringify(this.options));
    }
}
exports.EasyWebSocketCAttribute = EasyWebSocketCAttribute;
//# sourceMappingURL=attribute.js.map