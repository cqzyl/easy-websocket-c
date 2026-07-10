export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function waitFor<T>(
  label: string,
  check: () => T | undefined | null | false,
  timeout = 5000,
  interval = 50,
): Promise<T> {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      const value = check();
      if (value) {
        clearInterval(timer);
        resolve(value as T);
        return;
      }

      if (Date.now() - start >= timeout) {
        clearInterval(timer);
        reject(new Error(`timeout waiting for ${label}`));
      }
    }, interval);
  });
}

export type TrackedSocket = {
  openCount: number;
  closeCount: number;
  messageCount: number;
  heartCloseCount: number;
  offlineCount: number;
  onlineCount: number;
    errorCount: 0,
  messages: unknown[];
};

export function createTracker(): TrackedSocket {
  return {
    openCount: 0,
    closeCount: 0,
    messageCount: 0,
    heartCloseCount: 0,
    offlineCount: 0,
    onlineCount: 0,
    errorCount: 0,
    messages: [],
  };
}
