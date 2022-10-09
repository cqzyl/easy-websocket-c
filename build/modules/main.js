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
            if (_this.errorController) {
                // 停止错误监听
                _this.errorController.abort();
                _this.errorController = null;
            }
            _this.webSocket = null;
        });
    };
    /** 启动联网检测 */
    EasyWebSocketC.prototype.startOnlineWatch = function () {
        var _this = this;
        this.onlineAbort = (0, network_1.online)(function (abort) {
            if ((_this.options.onlineContect || _this.options.autoContect)
                && _this.statusVal === attribute_1.EasyWebSocketCStatus.WAITTING) {
                // 如果重连启用且正在等待重新连接，则重新连接
                _this.initSocket();
            }
        });
    };
    /** 停止断网检测重连功能 */
    EasyWebSocketC.prototype.stopOfflineWatch = function () {
        // 停止事件监听
        this.offlineAbort.abort();
        this.offlineAbort = null;
    };
    /* ****************** 网络 ****** end ****************** */
    /** 启动Error监听 */
    EasyWebSocketC.prototype.startErrorWatch = function () {
        var errorController = new AbortController();
        this.webSocket.addEventListener('error', function (ev) {
            console.log({ error: ev });
            // console.error(ev);
        }, {
            signal: errorController.signal
        });
        this.errorController = errorController;
    };
    /** 初始化websocket连接 */
    EasyWebSocketC.prototype.initSocket = function () {
        /** 创建socket */
        var socket = new WebSocket(this.socketOptions.url, this.socketOptions.protocols);
        this.webSocket = socket;
        this.startOnlineWatch();
        this.startOfflineWatch();
        this.startErrorWatch();
    };
    /** 创建websocket连接 */
    EasyWebSocketC.prototype.open = function (url, protocols) {
        // 存储参数，用于重连操作
        this.socketOptions = {
            url: url,
            protocols: protocols,
        };
        this.initSocket();
        // if (this.options.autoContect) {
        //   // 自动重连逻辑（包括断网或其他错误导致断开的重连）
        //   this.startAutoContect();
        // } else if (this.options.onlineContect) {
        //   // 断网重连逻辑（只在断网后重新连接）
        //   this.startNetworkAutoContect();
        // }
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
        this.webSocket = null;
        this.statusVal = attribute_1.EasyWebSocketCStatus.CLOSED;
    };
    /**
     * Fired when a connection with a WebSocket is opened. Also available via the onopen property.
     * @param {function} listener
     * @param {boolean} options
     */
    EasyWebSocketC.prototype.onOpen = function (listener, options) {
        // Connection opened
        this.webSocket.addEventListener('open', listener, options);
        return this;
    };
    /**
     * Listen for messages
     * @descriptions Fired when data is received through a WebSocket. Also available via the onmessage property.
     * @param {function} listener
     * @param {boolean} options
     */
    EasyWebSocketC.prototype.onMessage = function (listener, options) {
        this.webSocket.addEventListener('message', listener, options);
        // console.log('Message from server ', event.data);
        return this;
    };
    /**
     * Fired when a connection with a WebSocket is closed. Also available via the onclose property
     * @param {function} listener
     * @param {boolean} options
     */
    EasyWebSocketC.prototype.onClose = function (listener, options) {
        this.webSocket.addEventListener('close', listener, options);
        return this;
    };
    /**
     * Fired when a connection with a WebSocket has been closed because of an error, such as when some data couldn't be sent. Also available via the onerror property.
     * @param {function} listener
     * @param {boolean} options
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