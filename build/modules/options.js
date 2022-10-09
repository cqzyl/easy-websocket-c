"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EasyWebSocketCOptions = void 0;
/*
 * @Description: 参数
 * @Author: ChenQiang
 * @Date: 2022-09-30 09:15:35
 * @LastEditors: ChenQiang
 * @LastEditTime: 2022-09-30 09:15:36
 * @FilePath: \src\modules\options.ts
 */
var mapper_json_c_1 = require("mapper-json-c");
/** 主对象参数声明 */
var EasyWebSocketCOptions = /** @class */ (function () {
    function EasyWebSocketCOptions(options) {
        /** 自动重连 */
        this.autoContect = true;
        /** 联网重连 */
        this.onlineContect = true;
        if (options) {
            (0, mapper_json_c_1.mapperJsonC)(options, EasyWebSocketCOptions);
        }
    }
    __decorate([
        (0, mapper_json_c_1.JsonProperty)()
    ], EasyWebSocketCOptions.prototype, "autoContect", void 0);
    __decorate([
        (0, mapper_json_c_1.JsonProperty)()
    ], EasyWebSocketCOptions.prototype, "onlineContect", void 0);
    return EasyWebSocketCOptions;
}());
exports.EasyWebSocketCOptions = EasyWebSocketCOptions;
//# sourceMappingURL=options.js.map