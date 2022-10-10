/*
 * @Description: 属性
 * @Author: ChenQiang
 * @Date: 2022-10-08 17:16:04
 * @LastEditors: ChenQiang
 * @LastEditTime: 2022-10-08 17:16:04
 * @FilePath: \src\modules\params.ts
 */

import { EasyWebSocketCOptions } from './options';

/**
 * @description: 运行状态枚举
 */
export enum EasyWebSocketCStatus {
  /** 正在运行 */
  RUNNING,
  /** 正在等待重连 */
  WAITTING,
  /** 运行终止 */
  CLOSED,
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
  get status() {
    return EasyWebSocketCStatus[this.statusVal];
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
    return this.options.onlineContect || this.options.autoContect;
  }

  /** 重连等待计时器 */
  protected retryTimeCloseKey: number;

  /** 实例 */
  protected webSocket: WebSocket;

  /** 运行状态值 */
  protected statusVal: EasyWebSocketCStatus = EasyWebSocketCStatus.CLOSED;

  /** （停止）联网监听（abort实例） */
  protected onlineAbort?: AbortController;

  /** （停止）断网监听（abort实例） */
  protected offlineAbort?: AbortController;

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
    this.options = new EasyWebSocketCOptions(options);
  }
}
