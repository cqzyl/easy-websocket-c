/*
 * @Description: 参数
 * @Author: ChenQiang
 * @Date: 2022-09-30 09:15:35
 * @LastEditors: ChenQiang
 * @LastEditTime: 2022-09-30 09:15:36
 * @FilePath: \src\modules\options.ts
 */
import { JsonProperty, mapperJsonC } from 'mapper-json-c';

/** 主对象参数声明 */
export class EasyWebSocketCOptions {
  /** 自动重连 */
  @JsonProperty()
  autoContect?: boolean = true;

  /** 联网重连 */
  @JsonProperty()
  onlineContect?: boolean = true;

  constructor(options?: Partial<EasyWebSocketCOptions>) {
    if (options) {
      mapperJsonC(options, EasyWebSocketCOptions)
    }
  }
}
