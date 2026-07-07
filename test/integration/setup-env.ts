import WebSocket from 'ws';

(global as any).WebSocket = WebSocket;

type ListenerEntry = {
  fn: (event: Event) => void;
  signal?: AbortSignal;
};

const eventListeners = new Map<string, Set<ListenerEntry>>();

(global as any).window = {
  addEventListener(type: string, listener: (event: Event) => void, options?: { signal?: AbortSignal }) {
    if (!eventListeners.has(type)) {
      eventListeners.set(type, new Set());
    }

    const entry: ListenerEntry = { fn: listener, signal: options?.signal };
    eventListeners.get(type)!.add(entry);

    options?.signal?.addEventListener('abort', () => {
      eventListeners.get(type)?.delete(entry);
    });
  },
  removeEventListener() {
    // not required for current tests
  },
};

export function dispatchNetworkEvent(type: 'online' | 'offline') {
  eventListeners.get(type)?.forEach(({ fn }) => {
    fn(new Event(type));
  });
}
