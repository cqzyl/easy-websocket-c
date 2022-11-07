"use strict";
/*
 * @Description: 属性
 * @Author: ChenQiang
 * @Date: 2022-10-08 17:16:04
 * @LastEditors: ChenQiang
 * @LastEditTime: 2022-10-08 17:16:04
 * @FilePath: \src\modules\params.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EasyWebSocketCAttribute = exports.NetWorkStatusEnum = exports.EasyWebSocketCStatus = void 0;
var options_1 = require("./options");
var baseAutoContect = new options_1.AutoContect();
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
var EasyWebSocketCAttribute = /** @class */ (function () {
    /* ****************** websocket close 事件 ****** end   ****************** */
    function EasyWebSocketCAttribute(options) {
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
        this.options = new options_1.EasyWebSocketCOptions(options);
    }
    Object.defineProperty(EasyWebSocketCAttribute.prototype, "socket", {
        /** socket 实例 */
        get: function () {
            return this.webSocket;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EasyWebSocketCAttribute.prototype, "status", {
        /** 运行状态 */
        get: function () {
            return EasyWebSocketCStatus[this.statusVal];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EasyWebSocketCAttribute.prototype, "isRetryWhenOffline", {
        /** 断网后尝试重新连接 */
        get: function () {
            var autoContect = this.options.autoContect;
            return autoContect === true || (typeof autoContect === 'object' && autoContect.onlineContect);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EasyWebSocketCAttribute.prototype, "isTimeContect", {
        /** 开启连接心跳检测 */
        get: function () {
            var autoContect = this.options.autoContect;
            return autoContect === true ? baseAutoContect.timeContect : (typeof autoContect === 'object' && autoContect.timeContect);
        },
        enumerable: false,
        configurable: true
    });
    return EasyWebSocketCAttribute;
}());
exports.EasyWebSocketCAttribute = EasyWebSocketCAttribute;
//# sourceMappingURL=attribute.js.map