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
        this.offlineAbort = (0, network_1.offline)(function (abort) {
            _this.waittingClear();
        });
    };
    /** 停止断网检测重连功能 */
    EasyWebSocketC.prototype.stopOfflineWatch = function () {
        // 停止事件监听
        this.offlineAbort.abort();
        this.offlineAbort = null;
    };
    /** 启动联网检测 */
    EasyWebSocketC.prototype.startOnlineWatch = function () {
        var _this = this;
        this.onlineAbort = (0, network_1.online)(function (abort) {
            if ((_this.isRetryWhenOffline)
                && _this.statusVal === attribute_1.EasyWebSocketCStatus.WAITTING) {
                // 如果重连启用且正在等待重新连接，则重新连接
                clearTimeout(_this.retryTimeCloseKey);
                _this.retryTimeCloseKey = setTimeout(function () {
                    console.log('网络重新连接，正在尝试重连');
                    _this.initSocket();
                }, 1000);
            }
        });
    };
    /** 停止联网检测 */
    EasyWebSocketC.prototype.stopOnlineWatch = function () {
        // 停止事件监听
        this.onlineAbort.abort();
        this.onlineAbort = null;
    };
    /* ****************** 网络 ****** end ****************** */
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
        this.webSocket = null;
    };
    /** 创建websocket连接 */
    EasyWebSocketC.prototype.open = function (url, protocols, reOpen) {
        if (this.webSocket) {
            if (reOpen) {
                this.close();
                console.warn('连接已关闭');
            }
            else {
                console.warn('连接已存在，未重新建立新连接');
                return this;
            }
        }
        // 存储参数，用于重连操作
        this.socketOptions = {
            url: url,
            protocols: protocols,
        };
        this.initSocket();
        this.startOnlineWatch();
        this.startOfflineWatch();
        // 初始化状态
        this.statusVal = attribute_1.EasyWebSocketCStatus.RUNNING;
        console.warn('连接已创建');
        return this;
    };
    /** Transmits data using the WebSocket connection. data can be a string, a Blob, an ArrayBuffer, or an ArrayBufferView. */
    EasyWebSocketC.prototype.send = function (data) {
        this.webSocket.send(data);
        return this;
    };
    /** Closes the WebSocket connection, optionally using code as the the WebSocket connection close code and reason as the the WebSocket connection close reason. */
    EasyWebSocketC.prototype.close = function (code, reason) {
        this.webSocket.close(code, reason);
        this.stopOfflineWatch();
        this.stopOnlineWatch();
        this.stopListenEvent();
        this.webSocket = null;
        this.statusVal = attribute_1.EasyWebSocketCStatus.CLOSED;
    };
    /**
     * Fired when a connection with a WebSocket is opened. Also available via the onopen property.
     */
    EasyWebSocketC.prototype.onOpen = function (listener) {
        // Connection opened
        this.closeCallback.push(listener);
        return this;
    };
    /**
     * Listen for messages
     * @descriptions Fired when data is received through a WebSocket. Also available via the onmessage property.
     */
    EasyWebSocketC.prototype.onMessage = function (listener) {
        this.closeCallback.push(listener);
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