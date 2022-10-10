
/*
 * @Description: 主文件
 * @Author: ChenQiang
 * @Date: 2022-09-30 09:18:52
 * @LastEditors: ChenQiang
 * @LastEditTime: 2022-09-30 09:18:52
 * @FilePath: \src\modules\main.ts
 */
import { EasyWebSocketCAttribute, EasyWebSocketCStatus, ICallBack } from './attribute';
import { offline, online } from './network';
import { EasyWebSocketCOptions } from './options';

/** 指定错误不重新连 */
interface IFilterData {
  code?: number;
  reason?: string
}


/** socket实体 */
export default class EasyWebSocketC extends EasyWebSocketCAttribute<EasyWebSocketC> {
  constructor(options?: EasyWebSocketCOptions) {
    super(options);
  }

  /* ****************** 网络 ****** start ****************** */
  /**
   * 断网检测
   * 断网后自动清除 socket 实例
   */
  protected startOfflineWatch() {
    this.offlineAbort = offline((abort) => {
      this.waittingClear();
    });
  }

  /** 停止断网检测重连功能 */
  protected stopOfflineWatch() {
    // 停止事件监听
    this.offlineAbort?.abort();
    this.offlineAbort = null;
  }

  /** 启动联网检测 */
  protected startOnlineWatch() {
    this.onlineAbort = online((abort) => {
      if (
        (this.isRetryWhenOffline)
        && this.statusVal === EasyWebSocketCStatus.WAITTING
      ) {
        // 如果重连启用且正在等待重新连接，则重新连接
        clearTimeout(this.retryTimeCloseKey);

        this.retryTimeCloseKey = setTimeout(() => {
          console.log('网络重新连接，正在尝试重连');
          this.initSocket();
        }, 1000);
      }
    });
  }

  /** 停止联网检测 */
  protected stopOnlineWatch() {
    // 停止事件监听
    this.onlineAbort?.abort();
    this.onlineAbort = null;
  }

  /* ****************** 网络 ****** end ****************** */

  /** 初始化websocket连接 */
  protected initSocket() {
    /** 创建socket */
    const socket = new WebSocket(this.socketOptions.url, this.socketOptions.protocols);

    this.webSocket = socket;

    this.startListenEvent();
  }

  /** 注册监听事件 */
  protected startListenEvent() {
    // open
    this.webSocket.addEventListener('open', (ev) => {
      this.openCallback.forEach(cb => cb.call(this, ev));
    }, false);

    // error
    this.errorController = new AbortController();

    this.webSocket.addEventListener('error', (ev) => {
      this.errorCallback.forEach(cb => cb.call(this, ev));
    }, {
      signal: this.errorController.signal
    });

    // message
    this.messageController = new AbortController();
    
    this.webSocket.addEventListener('message', (ev) => {
      this.messageCallback.forEach(cb => cb.call(this, ev));
    }, {
      signal: this.messageController.signal
    });
    
    // close
    this.closeController = new AbortController();
    
    this.webSocket.addEventListener('close', (ev) => {
      this.closeCallback.forEach(cb => cb.call(this, ev));
    }, {
      signal: this.closeController.signal
    });
  }

  /** 停止监听事件 */
  protected stopListenEvent() {
    this.errorController?.abort();
    this.errorController = null;

    this.messageController?.abort();
    this.messageController = null;

    this.closeController?.abort();
    this.closeController = null;
  }

  /** 等待中清除其他状态 */
  protected waittingClear() {
    this.statusVal = EasyWebSocketCStatus.WAITTING;

    this.stopListenEvent();
    
    this.webSocket = null;
  }

  /** 创建websocket连接 */
  open(url: string | URL, protocols: string | string[] | undefined, reOpen?: true) {
    if (this.webSocket) {
      if (reOpen) {
        this.close(1000, 'easy-websocket-c 重新启动 websocket', false);
        console.warn('连接已关闭');
      } else {
        console.warn('连接已存在，未重新建立新连接');
        return this;
      }
    }
    // 存储参数，用于重连操作
    this.socketOptions = {
      url,
      protocols,
    };

    this.initSocket();

    this.startOnlineWatch();
    this.startOfflineWatch();
    
    // 初始化状态
    this.statusVal = EasyWebSocketCStatus.RUNNING;

    console.warn('连接已创建');

    return this;
  }

  /** Transmits data using the WebSocket connection. data can be a string, a Blob, an ArrayBuffer, or an ArrayBufferView. */
  send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
    this.webSocket.send(data);

    return this;
  }

  /** Closes the WebSocket connection, optionally using code as the the WebSocket connection close code and reason as the the WebSocket connection close reason. */
  close(code?: number, reason?: string, notClearListenEvent?: boolean) {
    this.webSocket?.close(code, reason);
    
    this.stopOfflineWatch();

    this.stopOnlineWatch();
    this.stopListenEvent();

    if (!notClearListenEvent) {
      this.clearListenEvent();
    }

    this.webSocket = null;
    this.statusVal = EasyWebSocketCStatus.CLOSED;
  }

  /**
   * Clear all fire metter who had bind except the network metter.
   */ 
  clearListenEvent() {
    this.openCallback = [];
    this.errorCallback = [];
    this.messageCallback = [];
    this.closeCallback = [];
  }

  /**
   * Fired when a connection with a WebSocket is opened. Also available via the onopen property.
   */  
  onOpen(listener: ICallBack<EasyWebSocketC>) {
    // Connection opened
    this.openCallback.push(listener);

    return this;
  }

  /**
   * Listen for messages
   * @descriptions Fired when data is received through a WebSocket. Also available via the onmessage property.
   */  
  onMessage(listener: ICallBack<EasyWebSocketC>) {
    this.messageCallback.push(listener);

    return this;
  }
  
  /**
   * Fired when a connection with a WebSocket is closed. Also available via the onclose property
   */  
  onClose(listener: ICallBack<EasyWebSocketC>) {
    this.closeCallback.push(listener);

    return this;
  }
  
  /**
   * Fired when a connection with a WebSocket has been closed because of an error, such as when some data couldn't be sent. Also available via the onerror property.
   */  
  onError(listener: ICallBack<EasyWebSocketC>) {
    this.errorCallback.push(listener);

    return this;
  }
}

// const a = new EasyWebSocketC();
// a.open('ws://172.28.20.210:8099/downloadSocket').onOpen(() => {
//   console.log('opened')
// }).onError(err => {
//   console.error(err)
// }).onClose((event) => {
//   console.log('close')
// })
