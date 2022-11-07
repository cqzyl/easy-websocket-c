/*
 * @Description: 网络检测
 * @Author: ChenQiang
 * @Date: 2022-09-30 09:12:40
 * @LastEditors: ChenQiang
 * @LastEditTime: 2022-09-30 09:12:40
 * @FilePath: \src\modules\network.ts
 */

export function online(callback: (event: Event, abort: AbortController) => void) {
  const onlineController = new AbortController();

  window.addEventListener('online', (e) => {
    callback(e, onlineController)
  }, {
    signal: onlineController.signal
  });
  return onlineController
}

export function offline(callback: (event: Event, abort: AbortController) => void) {
  const offlineController = new AbortController();
  
  window.addEventListener('offline', (e) => {
    callback(e, offlineController)
  }, {
    signal: offlineController.signal
  });
  return offlineController
}


