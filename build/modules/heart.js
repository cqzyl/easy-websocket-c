"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function useHeartMsgController() {
    /** 维护当前时间标识的定时器 */
    let timer = null;
    /** 上一次接收心跳包的时间 */
    let oldTime = 0;
    /** 开始维护当前时间标识 */
    function startHeartKeep(socket) {
        stopHeartKeep();
        oldTime = Date.now();
        timer = setInterval(() => {
            socket.send('heartMessage');
            // 心跳包监听，如果超过10s没有收到心跳包，则认为连接已断开，并手动重启连接
            if (Date.now() - oldTime > 1000 * 10) {
                socket.reopen();
            }
        }, 1000 * 5); // 每5s发送一次心跳包
    }
    /** 收到心跳包（收到任何消息都可以认为是心跳包） */
    function onHeart() {
        oldTime = Date.now();
    }
    /** 停止维护当前时间标识 */
    function stopHeartKeep() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }
    return {
        startHeartKeep,
        stopHeartKeep,
        onHeart,
    };
}
exports.default = useHeartMsgController;
//# sourceMappingURL=heart.js.map