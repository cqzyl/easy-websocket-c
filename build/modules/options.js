"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EasyWebSocketCOptions = exports.AutoContect = void 0;
/*
 * @Description: 参数
 * @Author: ChenQiang
 * @Date: 2022-09-30 09:15:35
 * @LastEditors: ChenQiang
 * @LastEditTime: 2024-04-24 17:16:07
 * @FilePath: \src\modules\options.ts
 */
const mapper_json_c_1 = require("mapper-json-c");
class AutoContect {
    /** 联网重连 - 默认开启
     * @description websocket无法稳定检测到网络断开导致的连接关闭，建议保持开启状态。不过即便为关闭状态下，onOffline事件仍会触发
     **/
    onlineContect = true;
    /**
     * 心跳检测最大尝试次数
     * @default 0 永远尝试重新连接
     */
    max = 0;
    /**
     * 心跳检测(等待时间ms) 0 为关闭心跳检测
     * @description 开启断网重连状态下, 断网后默认使用断网重连检测
     **/
    timeContect = 3 * 1000;
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
exports.AutoContect = AutoContect;
/** 主对象参数声明 */
class EasyWebSocketCOptions {
    /** 自动重连 */
    autoContect = true;
}
__decorate([
    (0, mapper_json_c_1.JsonProperty)({ clazz: AutoContect })
], EasyWebSocketCOptions.prototype, "autoContect", void 0);
exports.EasyWebSocketCOptions = EasyWebSocketCOptions;
//# sourceMappingURL=options.js.map