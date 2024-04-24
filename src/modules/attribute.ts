/*
 * @Description: 属性
 * @Author: ChenQiang
 * @Date: 2022-10-08 17:16:04
 * @LastEditors: ChenQiang
 * @LastEditTime: 2024-04-24 17:15:46
 * @FilePath: \src\modules\attribute.ts
 */

import { mapperJsonC } from 'mapper-json-c';
import { AutoContect, EasyWebSocketCOptions } from './options';

const baseAutoContect = new AutoContect()

/**
 * @description: 运行状态枚举
 */
export enum EasyWebSocketCStatus {
  /** 正在连接 */
  CONNECTING,
  /** 正在运行 */
  RUNNING,
  /** 正在等待重连 */
  WAITTING,
  /** 运行终止 */
  CLOSED,
}

/** 网络状态枚举 */
export enum NetWorkStatusEnum {
  OFFLINE,
  ONLINE,
}

export type ICallBack<T> = (this: T, ev: Event) => any

/**
 * @description: 属性声明
 */
export class EasyWebSocketCAttribute<T> {
  /** 配置参数 */
  options: EasyWebSocketCOptions;

  /** socket 实例 */
  get socket() {
    return this.webSocket;
  }

  /** 运行状态 */
  get status(): 'CONNECTING' | 'RUNNING' | 'WAITTING' | 'CLOSED' {
    return EasyWebSocketCStatus[this.statusVal] as never;
  }

  /** socket api参数 */
  protected socketOptions: {
    url: string | URL;
    protocols?: string | string[];
  } = {
    url: '',
  }

  /** 断网后尝试重新连接 */
  protected get isRetryWhenOffline() {
    const { autoContect } = this.options;

    return autoContect === true || (typeof autoContect === 'object' && autoContect.onlineContect)
  }

  /** 实例 */
  protected webSocket: WebSocket;

  /** 运行状态值 */
  protected statusVal: EasyWebSocketCStatus = EasyWebSocketCStatus.CLOSED;

  /* ****************** 网络 ****** start ****************** */

  /** 网络状态值 */
  protected netWorkStatus: NetWorkStatusEnum = NetWorkStatusEnum.ONLINE;

  /** （停止）联网监听（abort实例） */
  protected onlineAbort?: AbortController;

  /** （停止）断网监听（abort实例） */
  protected offlineAbort?: AbortController;

  /** 联网监听回调 */
  protected onlineCallback: ICallBack<T>[] = []

  /** 断网监听回调 */
  protected offlineCallback: ICallBack<T>[] = []
  

  /* ****************** 网络 ****** start ****************** */

  /* ****************** 心跳检测 ****** start ****************** */

  /** 心跳检测次数判断 */
  timeContectNum: number = 0;

  /** 心跳检测最大次数 */
  protected get timeContectMaxNum() {
    const { autoContect } = this.options;
    if (!autoContect) {
      return -1;
    }

    if (autoContect === true) {
      return baseAutoContect.max;
    }

    return autoContect.max;
  }

  /** 开启连接心跳检测 */
  protected get isTimeContect() {
    const { autoContect } = this.options;

    return autoContect === true ? baseAutoContect.timeContect : (typeof autoContect === 'object' && autoContect.timeContect);
  }
  /* ****************** 心跳检测 ****** end ****************** */

  /* ****************** websocket 错误处理 ****** start ****************** */
  /** 错误监听（abort实例） */
  protected errorController?: AbortController;

  /** 错误回调列表 */
  protected errorCallback: ICallBack<T>[] = []
  /* ****************** websocket 错误处理 ****** end   ****************** */

  /* ****************** websocket open 事件 ****** start ****************** */
  /** open回调列表 */
  protected openCallback: ICallBack<T>[] = []
  /* ****************** websocket open 事件 ****** end   ****************** */

  /* ****************** websocket message 事件 ****** start ****************** */
  /** message监听（abort实例） */
  protected messageController?: AbortController;
  /** message回调列表 */
  protected messageCallback: ICallBack<T>[] = []
  /* ****************** websocket message 事件 ****** end   ****************** */

  /* ****************** websocket close 事件 ****** start ****************** */
  /** close监听（abort实例） */
  protected closeController?: AbortController;
  /** close回调列表 */
  protected closeCallback: ICallBack<T>[] = []
  /* ****************** websocket close 事件 ****** end   ****************** */

  constructor(options?: EasyWebSocketCOptions) {
    this.options = mapperJsonC(options, EasyWebSocketCOptions);
    console.log(options, JSON.stringify(this.options))
  }
}
