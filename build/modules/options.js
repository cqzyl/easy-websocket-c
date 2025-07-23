"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EasyWebSocketCOptions = exports.HeartContectOptions = exports.AutoContect = void 0;
/*
 * @Description: 参数
 * @Author: ChenQiang
 * @Date: 2022-09-30 09:15:35
 * @LastEditors: ChenQiang
 * @LastEditTime: 2025-07-22 22:25:18
 * @FilePath: \src\modules\options.ts
 */
const mapper_json_c_1 = require("mapper-json-c");
class AutoContect {
    constructor() {
        /** 联网重连 - 默认开启
         * @description websocket无法稳定检测到网络断开导致的连接关闭，建议保持开启状态。不过即便为关闭状态下，onOffline事件仍会触发
         **/
        this.onlineContect = true;
        /**
         * 心跳检测最大尝试次数
         * @default 0 永远尝试重新连接
         */
        this.max = 0;
        /**
         * 心跳检测(等待时间ms) 0 为关闭心跳检测
         * @description 开启断网重连状态下, 断网后默认使用断网重连检测
         **/
        this.timeContect = 3 * 1000;
        /**
         * 心跳检测退避机制
         * @description 下一次尝试重连的间隔时间 = 心跳检测间隔时间 + abdicationTime * 尝试次数
         **/
        this.abdicationTime = 0;
    }
}
__decorate([
    (0, mapper_json_c_1.JsonProperty)()
], AutoContect.prototype, "onlineContect", void 0);
__decorate([
    (0, mapper_json_c_1.JsonProperty)()
], AutoContect.prototype, "max", void 0);
__decorate([
    (0, mapper_json_c_1.JsonProperty)()
], AutoContect.prototype, "timeContect", void 0);
__decorate([
    (0, mapper_json_c_1.JsonProperty)()
], AutoContect.prototype, "abdicationTime", void 0);
exports.AutoContect = AutoContect;
/** 心跳包检测配置 */
class HeartContectOptions {
    constructor() {
        /** 是否在所有消息中过滤掉心跳消息
         * @default true
        */
        this.isFilter = true;
        /** 发送心跳包后的额外等待时间 ms
         * @default 5000
         */
        this.waitTime = 5 * 1000;
        /**
         * 最大尝试次数
         * @default 0 永远尝试重新连接
         */
        this.max = 0;
        /**
         * 等待时间ms , 0 为关闭心跳检测
         * @default 5000
         */
        this.timeContect = 5 * 1000;
    }
}
__decorate([
    (0, mapper_json_c_1.JsonProperty)()
], HeartContectOptions.prototype, "message", void 0);
__decorate([
    (0, mapper_json_c_1.JsonProperty)()
], HeartContectOptions.prototype, "isFilter", void 0);
__decorate([
    (0, mapper_json_c_1.JsonProperty)()
], HeartContectOptions.prototype, "max", void 0);
__decorate([
    (0, mapper_json_c_1.JsonProperty)()
], HeartContectOptions.prototype, "timeContect", void 0);
exports.HeartContectOptions = HeartContectOptions;
/** 主对象参数声明 */
class EasyWebSocketCOptions {
    constructor() {
        /** 自动重连 */
        this.autoContect = true;
        /** 心跳包检测 */
        this.heart = false;
    }
}
__decorate([
    (0, mapper_json_c_1.JsonProperty)({ clazz: AutoContect })
], EasyWebSocketCOptions.prototype, "autoContect", void 0);
__decorate([
    (0, mapper_json_c_1.JsonProperty)({ clazz: HeartContectOptions })
], EasyWebSocketCOptions.prototype, "heart", void 0);
exports.EasyWebSocketCOptions = EasyWebSocketCOptions;
//# sourceMappingURL=options.js.map