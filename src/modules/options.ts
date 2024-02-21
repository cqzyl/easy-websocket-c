/*
 * @Description: 参数
 * @Author: ChenQiang
 * @Date: 2022-09-30 09:15:35
 * @LastEditors: ChenQiang
 * @LastEditTime: 2024-02-21 16:11:10
 * @FilePath: \src\modules\options.ts
 */
import { JsonProperty, mapperJsonC } from 'mapper-json-c';

export class AutoContect {
  /** 联网重连 */
  @JsonProperty()
  onlineContect?: boolean = true;

  /**
   * 联网重连最大尝试次数
   * @default 0 永远尝试重新连接
   */
  @JsonProperty()
  max?: number = 0;

  /**
   * 心跳检测(时间ms) 0 为关闭心跳检测
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

  constructor(options?: Partial<EasyWebSocketCOptions>) {
    if (options) {
      Object.assign(
        this,
        mapperJsonC(options, EasyWebSocketCOptions)
      )
    }
  }
}
