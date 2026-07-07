"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * @Description: 主文件
 * @Author: ChenQiang
 * @Date: 2022-09-30 09:18:52
 * @LastEditors: ChenQiang
 * @LastEditTime: 2025-07-25 00:20:30
 * @FilePath: \src\modules\main.ts
 */
const attribute_1 = require("./attribute");
const network_1 = require("./network");
/** socket实体 */
class EasyWebSocketC extends attribute_1.EasyWebSocketCAttribute {
    constructor(options) {
        super(options);
        /* ****************** 网络 ****** end ****************** */
        /* ****************** 报错重连检测 ****** start ****************** */
        /** 报错重连timer */
        this.timeWatchTimer = null;
        /* ****************** 报错重连检测 ****** end ****************** */
        /* ****************** 心跳检测 ****** start ****************** */
        /** 维护心跳包发送的定时器 */
        this.hearTimer = null;
        /** 心跳响应超时定时器 */
        this.heartTimeoutTimer = null;
        /** 心跳尝试次数 */
        this.heartTryNumber = 0;
    }
    /* ****************** 网络 ****** start ****************** */
    /**
     * 断网检测
     * 断网后自动清除 socket 实例
     */
    startOfflineWatch() {
        this.offlineAbort = (0, network_1.offline)((e, abort) => {
            this.netWorkStatus = attribute_1.NetWorkStatusEnum.OFFLINE;
            // 停止心跳包发送
            this.stopHeartKeep();
            try {
                this.offlineCallback.forEach(v => v.call(this, e));
            }
            catch (error) {
                console.error(error);
            }
            if (this.isRetryWhenOffline) {
                // 如果重连启用，则执行逻辑
                console.warn('网络断开，正在等待重连');
                this.waittingClear();
            }
            else {
                // 如果重连未启用，则清空socket
                this.close(false, 3001, '网络断开');
            }
        });
    }
    /** 停止断网检测重连功能 */
    stopOfflineWatch() {
        var _a;
        // 停止事件监听
        (_a = this.offlineAbort) === null || _a === void 0 ? void 0 : _a.abort();
        this.offlineAbort = null;
    }
    /** 启动联网检测 */
    startOnlineWatch() {
        this.onlineAbort = (0, network_1.online)((e, abort) => {
            this.netWorkStatus = attribute_1.NetWorkStatusEnum.ONLINE;
            try {
                this.onlineCallback.forEach(v => v.call(this, e));
            }
            catch (error) {
                console.error(error);
            }
            if (this.isRetryWhenOffline && this.statusVal === attribute_1.EasyWebSocketCStatus.WAITTING) {
                // 如果重连启用且正在等待重新连接，则重新连接
                console.warn('网络重新连接，正在尝试重连');
                this.reopen();
            }
        });
    }
    /** 停止联网检测 */
    stopOnlineWatch() {
        var _a;
        // 停止事件监听
        (_a = this.onlineAbort) === null || _a === void 0 ? void 0 : _a.abort();
        this.onlineAbort = null;
    }
    /** 清除报错重连定时器 */
    clearTimeWatch() {
        if (this.timeWatchTimer) {
            clearTimeout(this.timeWatchTimer);
            this.timeWatchTimer = null;
        }
    }
    /** 开始报错重连检测 */
    startTimeWatch() {
        var _a;
        if (!(
        // 当前已断开连接
        ((_a = this.webSocket) === null || _a === void 0 ? void 0 : _a.readyState) === WebSocket.CLOSED &&
            // 非主动关闭
            this.statusVal !== attribute_1.EasyWebSocketCStatus.CLOSED &&
            // 当前非断网等待重连状态
            !(this.netWorkStatus === attribute_1.NetWorkStatusEnum.OFFLINE
                && this.isRetryWhenOffline) &&
            // 已开启报错重连检测
            this.isTimeContect)) {
            return false;
        }
        // 更新状态为等待中
        this.statusVal = attribute_1.EasyWebSocketCStatus.WAITTING;
        if (this.timeContectMaxNum === 0 || this.timeContectMaxNum > this.timeContectNum) {
            // 报错重连检测不设置上限
            this.timeContectNum += 1;
            // 报错重连检测
            console.warn(`报错重连检测连接第${this.timeContectNum}次`);
            this.reopen();
        }
        else {
            // 关闭心跳检测
            console.warn('报错重连检测结束');
            return false;
        }
    }
    /** 调度心跳响应超时检测 */
    scheduleHeartTimeout() {
        var _a;
        this.clearHeartTimeout();
        const heartOptions = this.options.heart;
        if (!heartOptions || typeof heartOptions !== 'object' || !heartOptions.message) {
            return;
        }
        const waitTime = (_a = heartOptions.waitTime) !== null && _a !== void 0 ? _a : 5 * 1000;
        if (!waitTime) {
            return;
        }
        this.heartTimeoutTimer = setTimeout(() => {
            this.onHeartTimeout();
        }, waitTime);
    }
    /** 清除心跳响应超时检测 */
    clearHeartTimeout() {
        if (this.heartTimeoutTimer) {
            clearTimeout(this.heartTimeoutTimer);
            this.heartTimeoutTimer = null;
        }
    }
    /** 心跳响应超时 */
    onHeartTimeout() {
        var _a;
        const heartOptions = this.options.heart;
        if (!heartOptions || typeof heartOptions !== 'object') {
            return;
        }
        this.stopHeartKeep();
        this.heartCloseCallback.forEach(cb => cb.call(this, {
            code: 1005,
            reason: '无法收到心跳包，心跳包发送异常，连接手动终止'
        }));
        (_a = this.webSocket) === null || _a === void 0 ? void 0 : _a.close(1000, '心跳检测到连接断开， easy-websocket-c 主动断开 websocket进行重新连接');
    }
    /** 开始维护当前时间标识 */
    startHeartKeep() {
        this.stopHeartKeep();
        const heartOptions = this.options.heart;
        // 没有消息配置直接退出
        if (!heartOptions || typeof heartOptions !== 'object' || !heartOptions.message) {
            return console.error('heart.message is undefined');
        }
        if (!heartOptions.timeContect) {
            // 未配置等待时间
            console.error('heart.timeContect is undefined');
            return false;
        }
        // 发送心跳消息
        console.warn('注册心跳包发送');
        this.send(heartOptions.message);
        this.hearTimer = setInterval(() => {
            if (!heartOptions.message) {
                return console.error('heart.message is undefined');
            }
            // 发送心跳消息
            this.send(heartOptions.message);
            this.heartTryNumber += 1;
            console.log(`第${this.heartTryNumber + 1}次心跳包`);
        }, heartOptions.timeContect); // 每timeContect发送一次心跳包
    }
    /** 收到心跳包（收到任何消息都可以认为是心跳包），重置心跳超时 */
    onHeart() {
        this.heartTryNumber = 0;
        this.scheduleHeartTimeout();
    }
    /** 停止维护当前时间标识 */
    stopHeartKeep() {
        this.clearHeartTimeout();
        if (this.hearTimer) {
            console.warn('停止心跳包发送');
            clearInterval(this.hearTimer);
            this.hearTimer = null;
        }
    }
    /* ****************** 心跳检测 ****** end ****************** */
    /** 初始化websocket连接 */
    initSocket() {
        this.stopListenEvent();
        try {
            // 永远只保持一个socket连接，关闭因为意外导致未关闭的socket连接
            if (this.webSocket) {
                this.webSocket.close();
            }
        }
        catch (error) { }
        /** 创建socket */
        const socket = new WebSocket(this.socketOptions.url, this.socketOptions.protocols);
        this.webSocket = socket;
        this.startListenEvent();
    }
    /** 注册监听事件 */
    startListenEvent() {
        // open
        this.webSocket.addEventListener('open', (ev) => {
            console.warn('连接成功');
            this.clearTimeWatch();
            // 初始化相关状态参数
            // 修改socket状态
            this.statusVal = attribute_1.EasyWebSocketCStatus.RUNNING;
            // 初始化重连计时器
            this.timeContectNum = 0;
            if (this.options.heart) {
                // 开始心跳检测，发送心跳包
                this.startHeartKeep();
                this.onHeart();
            }
            this.openCallback.forEach(cb => cb.call(this, ev));
        }, false);
        // error
        this.errorController = new AbortController();
        this.webSocket.addEventListener('error', (ev) => {
            // 停止心跳包发送
            this.stopHeartKeep();
            this.errorCallback.forEach(cb => cb.call(this, ev));
        }, {
            signal: this.errorController.signal
        });
        // message
        this.messageController = new AbortController();
        this.webSocket.addEventListener('message', (ev) => {
            const heartOptions = this.options.heart;
            // 心跳检测逻辑
            if (heartOptions && typeof heartOptions === 'object' && heartOptions.message) {
                this.onHeart(); // 所有消息都会更新心跳包时间
                if (heartOptions.isFilter && ev.data === heartOptions.message) {
                    return;
                }
            }
            this.messageCallback.forEach(cb => cb.call(this, ev));
        }, {
            signal: this.messageController.signal
        });
        // close
        this.closeController = new AbortController();
        this.webSocket.addEventListener('close', (ev) => {
            // 停止心跳包发送
            this.stopHeartKeep();
            this.closeCallback.forEach(cb => cb.call(this, ev));
            // 心跳检测等待时间后，进行心跳检测鉴定
            if (this.isTimeContect && this.statusVal !== attribute_1.EasyWebSocketCStatus.CLOSED) {
                this.clearTimeWatch();
                this.timeWatchTimer = setTimeout(() => {
                    // 进行心跳检测鉴定
                    this.startTimeWatch();
                }, Math.min(this.isTimeContect + this.timeContectNum * this.abdicationTime, this.abdicationTimeMax));
            }
        }, {
            signal: this.closeController.signal
        });
    }
    /** 停止监听事件 */
    stopListenEvent() {
        var _a, _b, _c;
        (_a = this.errorController) === null || _a === void 0 ? void 0 : _a.abort();
        this.errorController = null;
        (_b = this.messageController) === null || _b === void 0 ? void 0 : _b.abort();
        this.messageController = null;
        (_c = this.closeController) === null || _c === void 0 ? void 0 : _c.abort();
        this.closeController = null;
    }
    /** 等待中清除其他状态 */
    waittingClear() {
        this.statusVal = attribute_1.EasyWebSocketCStatus.WAITTING;
        this.clearTimeWatch();
        this.stopListenEvent();
        this.webSocket.close(1000, '网络断开， easy-websocket-c 主动断开 websocket');
        this.webSocket = null;
    }
    /** 重连websocket */
    reopen() {
        this.initSocket();
    }
    /** 创建websocket连接 */
    open(url, protocols, forceOpen) {
        if (this.webSocket) {
            if (forceOpen) {
                this.close(false, 1000, 'easy-websocket-c 重新启动 websocket');
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
            url,
            protocols,
        };
        this.initSocket();
        this.startOnlineWatch();
        this.startOfflineWatch();
        console.warn('正在连接...');
        return this;
    }
    /** Transmits data using the WebSocket connection. data can be a string, a Blob, an ArrayBuffer, or an ArrayBufferView. */
    send(data) {
        this.webSocket.send(data);
        return this;
    }
    /** Closes the WebSocket connection, optionally using code as the the WebSocket connection close code and reason as the the WebSocket connection close reason. */
    close(notClearListenEvent, code, reason) {
        var _a;
        this.clearTimeWatch();
        // 主动关闭前先更新状态，避免 close 事件同步触发重连定时器
        this.statusVal = attribute_1.EasyWebSocketCStatus.CLOSED;
        (_a = this.webSocket) === null || _a === void 0 ? void 0 : _a.close(code, reason);
        this.stopOfflineWatch();
        this.stopOnlineWatch();
        this.stopListenEvent();
        this.stopHeartKeep();
        if (!notClearListenEvent) {
            this.clearListenEvent();
        }
        this.webSocket = null;
    }
    /**
     * Clear all fire metter who had bind except the network metter.
     */
    clearListenEvent() {
        this.openCallback = [];
        this.errorCallback = [];
        this.messageCallback = [];
        this.closeCallback = [];
        this.onlineCallback = [];
        this.offlineCallback = [];
    }
    /**
     * Fired when the socket is connected and when the network is connected
     */
    onOnline(listener) {
        this.onlineCallback.push(listener);
        return this;
    }
    /**
     * Fired when the socket is connected and when the network is disconnected
     */
    onOffline(listener) {
        this.offlineCallback.push(listener);
        return this;
    }
    /**
     * Fired when a connection with a WebSocket is opened. Also available via the onopen property.
     */
    onOpen(listener) {
        // Connection opened
        this.openCallback.push(listener);
        return this;
    }
    /**
     * Listen for messages
     * @descriptions Fired when data is received through a WebSocket. Also available via the onmessage property.
     */
    onMessage(listener) {
        this.messageCallback.push(listener);
        return this;
    }
    /**
     * Fired when a connection with a WebSocket is closed. Also available via the onclose property
     */
    onClose(listener) {
        this.closeCallback.push(listener);
        return this;
    }
    /**
     * Fired when a connection with a WebSocket has been closed because of an error, such as when some data couldn't be sent. Also available via the onerror property.
     */
    onError(listener) {
        this.errorCallback.push(listener);
        return this;
    }
    /**
     * Fired when a connection with a heart sender is closed.
     */
    onHeartClose(listener) {
        this.heartCloseCallback.push(listener);
        return this;
    }
}
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