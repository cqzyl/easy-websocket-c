/*
 * @Description: 参数
 * @Author: ChenQiang
 * @Date: 2022-09-30 09:15:35
 * @LastEditors: ChenQiang
 * @LastEditTime: 2025-07-22 22:25:18
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

  
  /**
   * 心跳检测退避机制
   * @description 下一次尝试重连的间隔时间 = 心跳检测间隔时间 + abdicationTime * 尝试次数
   **/
  @JsonProperty()
  abdicationTime?: number = 0;

  /**
   * 心跳检测最大等待时间 ms
   * @description 实际心跳检测等待时间 = min(心跳检测间隔时间 + abdicationTime * 尝试次数, abdicationTimeMax)
   * @default 60 * 1000
   */
  @JsonProperty()
  abdicationTimeMax?: number = 60 * 1000;
}

/** 心跳包检测配置 */
export class HeartContectOptions {
  /** 心跳包消息处理,
   * @description string则直接使用此参数比对心跳包 回调函数返回true代表为心跳消息，false代表非心跳消息
   */
  @JsonProperty()
  message: string;

  /** 是否在所有消息中过滤掉心跳消息
   * @default true
  */
  @JsonProperty()
  isFilter?: boolean = true

  /** 发送心跳包后的额外等待时间 ms
   * @default 5000
   */
  waitTime?: number = 5 * 1000;

  /**
   * 最大尝试次数
   * @default 0 永远尝试重新连接
   */
  @JsonProperty()
  max?: number = 0;

  /**
   * 等待时间ms , 0 为关闭心跳检测
   * @default 5000
   */
  @JsonProperty()
  timeContect?: number = 5 * 1000;
}


/** 主对象参数声明 */
export class EasyWebSocketCOptions {
  /** 自动重连 */
  @JsonProperty({ clazz: AutoContect })
  autoContect?: boolean | AutoContect = true;

  /** 心跳包检测 */
  @JsonProperty({ clazz: HeartContectOptions })
  heart: false | HeartContectOptions = false;
}
