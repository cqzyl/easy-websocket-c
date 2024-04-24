/*
 * @Description: 参数
 * @Author: ChenQiang
 * @Date: 2022-09-30 09:15:35
 * @LastEditors: ChenQiang
 * @LastEditTime: 2024-04-24 17:16:07
 * @FilePath: \src\modules\options.ts
 */
import { JsonProperty } from 'mapper-json-c';

export class AutoContect {
  /** 联网重连 - 默认开启
   * @description websocket无法稳定检测到网络断开导致的连接关闭，建议保持开启状态。不过即便为关闭状态下，onOffline事件仍会触发
   **/
  @JsonProperty()
  onlineContect?: boolean = true;

  /**
   * 心跳检测最大尝试次数
   * @default 0 永远尝试重新连接
   */
  @JsonProperty()
  max?: number = 0;

  /**
   * 心跳检测(等待时间ms) 0 为关闭心跳检测
   * @description 开启断网重连状态下, 断网后默认使用断网重连检测
   **/
  @JsonProperty()
  timeContect?: number = 3 * 1000;
}

/** 主对象参数声明 */
export class EasyWebSocketCOptions {
  /** 自动重连 */
  @JsonProperty({ clazz: AutoContect })
  autoContect?: boolean | AutoContect = true;
}
