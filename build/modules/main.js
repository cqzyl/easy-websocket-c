"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * @Description: 主文件
 * @Author: ChenQiang
 * @Date: 2022-09-30 09:18:52
 * @LastEditors: ChenQiang
 * @LastEditTime: 2022-09-30 09:18:52
 * @FilePath: \src\modules\main.ts
 */
var attribute_1 = require("./attribute");
var network_1 = require("./network");
/** socket实体 */
var EasyWebSocketC = /** @class */ (function (_super) {
    __extends(EasyWebSocketC, _super);
    function EasyWebSocketC(options) {
        return _super.call(this, options) || this;
    }
    /* ****************** 网络 ****** start ****************** */
    /**
     * 断网检测
     * 断网后自动清除 socket 实例
     */
    EasyWebSocketC.prototype.startOfflineWatch = function () {
        var _this = this;
        this.offlineAbort = (0, network_1.offline)(function (e, abort) {
            _this.netWorkStatus = attribute_1.NetWorkStatusEnum.OFFLINE;
            _this.waittingClear();
            if (_this.isRetryWhenOffline) {
                // 如果重连启用，则执行逻辑
                console.warn('网络断开，正在等待重连');
                try {
                    _this.offlineCallback.forEach(function (v) { return v.call(_this, e); });
                }
                catch (error) {
                    console.error(error);
                }
            }
        });
    };
    /** 停止断网检测重连功能 */
    EasyWebSocketC.prototype.stopOfflineWatch = function () {
        var _a;
        // 停止事件监听
        (_a = this.offlineAbort) === null || _a === void 0 ? void 0 : _a.abort();
        this.offlineAbort = null;
    };
    /** 启动联网检测 */
    EasyWebSocketC.prototype.startOnlineWatch = function () {
        var _this = this;
        this.onlineAbort = (0, network_1.online)(function (e, abort) {
            _this.netWorkStatus = attribute_1.NetWorkStatusEnum.ONLINE;
            if ((_this.isRetryWhenOffline)
                && _this.statusVal === attribute_1.EasyWebSocketCStatus.WAITTING) {
                // 如果重连启用且正在等待重新连接，则重新连接
                clearTimeout(_this.retryTimeCloseKey);
                try {
                    _this.onlineCallback.forEach(function (v) { return v.call(_this, e); });
                }
                catch (error) {
                    console.error(error);
                }
                _this.retryTimeCloseKey = setTimeout(function () {
                    console.warn('网络重新连接，正在尝试重连');
                    _this.initSocket();
                }, 1000);
            }
        });
    };
    /** 停止联网检测 */
    EasyWebSocketC.prototype.stopOnlineWatch = function () {
        var _a;
        // 停止事件监听
        (_a = this.onlineAbort) === null || _a === void 0 ? void 0 : _a.abort();
        this.onlineAbort = null;
    };
    /* ****************** 网络 ****** end ****************** */
    /* ****************** 心跳检测 ****** start ****************** */
    /** 开始心跳检测 */
    EasyWebSocketC.prototype.startTimeWatch = function () {
        var _this = this;
        clearTimeout(this.retryTimeCloseKey);
        this.retryTimeCloseKey = setTimeout(function () {
            // 心跳检测
            console.warn("\u5FC3\u8DF3\u68C0\u6D4B\u8FDE\u63A5\u7B2C".concat(++_this.timeContectNum, "\u6B21"));
            _this.reopen();
        }, this.isTimeContect);
    };
    /* ****************** 心跳检测 ****** end ****************** */
    /** 初始化websocket连接 */
    EasyWebSocketC.prototype.initSocket = function () {
        /** 创建socket */
        var socket = new WebSocket(this.socketOptions.url, this.socketOptions.protocols);
        this.webSocket = socket;
        this.startListenEvent();
    };
    /** 注册监听事件 */
    EasyWebSocketC.prototype.startListenEvent = function () {
        var _this = this;
        // open
        this.webSocket.addEventListener('open', function (ev) {
            console.warn('连接成功');
            // 初始化相关状态参数
            // 修改socket状态
            _this.statusVal = attribute_1.EasyWebSocketCStatus.RUNNING;
            // 初始化重连计时器
            _this.timeContectNum = 0;
            _this.openCallback.forEach(function (cb) { return cb.call(_this, ev); });
        }, false);
        // error
        this.errorController = new AbortController();
        this.webSocket.addEventListener('error', function (ev) {
            _this.errorCallback.forEach(function (cb) { return cb.call(_this, ev); });
        }, {
            signal: this.errorController.signal
        });
        // message
        this.messageController = new AbortController();
        this.webSocket.addEventListener('message', function (ev) {
            _this.messageCallback.forEach(function (cb) { return cb.call(_this, ev); });
        }, {
            signal: this.messageController.signal
        });
        // close
        this.closeController = new AbortController();
        this.webSocket.addEventListener('close', function (ev) {
            _this.closeCallback.forEach(function (cb) { return cb.call(_this, ev); });
            if ( // 非主动关闭
            _this.statusVal !== attribute_1.EasyWebSocketCStatus.CLOSED &&
                // 当前非断网等待重连状态
                !(_this.netWorkStatus === attribute_1.NetWorkStatusEnum.OFFLINE
                    && _this.isRetryWhenOffline) &&
                // 已开启心跳检测
                _this.isTimeContect) {
                // 更新状态为等待中
                _this.statusVal = attribute_1.EasyWebSocketCStatus.WAITTING;
                // 开始进行心跳检测
                _this.startTimeWatch();
            }
        }, {
            signal: this.closeController.signal
        });
    };
    /** 停止监听事件 */
    EasyWebSocketC.prototype.stopListenEvent = function () {
        var _a, _b, _c;
        (_a = this.errorController) === null || _a === void 0 ? void 0 : _a.abort();
        this.errorController = null;
        (_b = this.messageController) === null || _b === void 0 ? void 0 : _b.abort();
        this.messageController = null;
        (_c = this.closeController) === null || _c === void 0 ? void 0 : _c.abort();
        this.closeController = null;
    };
    /** 等待中清除其他状态 */
    EasyWebSocketC.prototype.waittingClear = function () {
        this.statusVal = attribute_1.EasyWebSocketCStatus.WAITTING;
        this.stopListenEvent();
        this.webSocket.close(1000, '网络断开， easy-websocket-c 主动断开 websocket');
        this.webSocket = null;
    };
    /** 重连websocket */
    EasyWebSocketC.prototype.reopen = function () {
        this.initSocket();
    };
    /** 创建websocket连接 */
    EasyWebSocketC.prototype.open = function (url, protocols, forceOpen) {
        if (this.webSocket) {
            if (forceOpen) {
                this.close(1000, 'easy-websocket-c 重新启动 websocket', false);
                console.warn('连接已关闭');
            }
            else {
                console.warn('连接已存在，未重新建立新连接');
                return this;
            }
        }
        console.warn('正在创建连接...');
        // 修改运行状态
        this.statusVal = attribute_1.EasyWebSocketCStatus.CONNECTING;
        // 存储参数，用于重连操作
        this.socketOptions = {
            url: url,
            protocols: protocols,
        };
        this.initSocket();
        this.startOnlineWatch();
        this.startOfflineWatch();
        console.warn('正在连接...');
        return this;
    };
    /** Transmits data using the WebSocket connection. data can be a string, a Blob, an ArrayBuffer, or an ArrayBufferView. */
    EasyWebSocketC.prototype.send = function (data) {
        this.webSocket.send(data);
        return this;
    };
    /** Closes the WebSocket connection, optionally using code as the the WebSocket connection close code and reason as the the WebSocket connection close reason. */
    EasyWebSocketC.prototype.close = function (code, reason, notClearListenEvent) {
        var _a;
        (_a = this.webSocket) === null || _a === void 0 ? void 0 : _a.close(code, reason);
        this.stopOfflineWatch();
        this.stopOnlineWatch();
        this.stopListenEvent();
        if (!notClearListenEvent) {
            this.clearListenEvent();
        }
        // 更新状态为关闭（只有主动关闭时状态才为CLOSED）
        this.statusVal = attribute_1.EasyWebSocketCStatus.CLOSED;
        this.webSocket = null;
    };
    /**
     * Clear all fire metter who had bind except the network metter.
     */
    EasyWebSocketC.prototype.clearListenEvent = function () {
        this.openCallback = [];
        this.errorCallback = [];
        this.messageCallback = [];
        this.closeCallback = [];
        this.onlineCallback = [];
        this.offlineCallback = [];
    };
    /**
     * Fired when the socket is connected and when the network is connected
     */
    EasyWebSocketC.prototype.onOnline = function (listener) {
        this.onlineCallback.push(listener);
        return this;
    };
    /**
     * Fired when the socket is connected and when the network is disconnected
     */
    EasyWebSocketC.prototype.onOffline = function (listener) {
        this.offlineCallback.push(listener);
        return this;
    };
    /**
     * Fired when a connection with a WebSocket is opened. Also available via the onopen property.
     */
    EasyWebSocketC.prototype.onOpen = function (listener) {
        // Connection opened
        this.openCallback.push(listener);
        return this;
    };
    /**
     * Listen for messages
     * @descriptions Fired when data is received through a WebSocket. Also available via the onmessage property.
     */
    EasyWebSocketC.prototype.onMessage = function (listener) {
        this.messageCallback.push(listener);
        return this;
    };
    /**
     * Fired when a connection with a WebSocket is closed. Also available via the onclose property
     */
    EasyWebSocketC.prototype.onClose = function (listener) {
        this.closeCallback.push(listener);
        return this;
    };
    /**
     * Fired when a connection with a WebSocket has been closed because of an error, such as when some data couldn't be sent. Also available via the onerror property.
     */
    EasyWebSocketC.prototype.onError = function (listener) {
        this.errorCallback.push(listener);
        return this;
    };
    return EasyWebSocketC;
}(attribute_1.EasyWebSocketCAttribute));
exports.default = EasyWebSocketC;
// const a = new EasyWebSocketC();
// a.open('ws://172.28.20.210:8099/downloadSocket').onOpen(() => {
//   console.log('opened')
// }).onError(err => {
//   console.error(err)
// }).onClose((event) => {
//   console.log('close')
// })
//# sourceMappingURL=main.js.map