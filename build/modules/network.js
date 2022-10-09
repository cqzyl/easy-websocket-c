"use strict";
/*
 * @Description: 网络检测
 * @Author: ChenQiang
 * @Date: 2022-09-30 09:12:40
 * @LastEditors: ChenQiang
 * @LastEditTime: 2022-09-30 09:12:40
 * @FilePath: \src\modules\network.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.offline = exports.online = void 0;
function online(callback) {
    var onlineController = new AbortController();
    window.addEventListener('online', function () {
        callback(onlineController);
    }, {
        signal: onlineController.signal
    });
    return onlineController;
}
exports.online = online;
function offline(callback) {
    var offlineController = new AbortController();
    window.addEventListener('offline', function () {
        callback(offlineController);
    }, {
        signal: offlineController.signal
    });
    return offlineController;
}
exports.offline = offline;
//# sourceMappingURL=network.js.map