// Serialize canonical reads. An invalidation fences every older in-flight read.
// Absolute values may decrease (spending); never merge balances with max().
export function createLiveBalanceCoordinator({ read, apply, currentOwner }) {
  let epoch = 0, running = null, dirty = false, stopped = false, controller = null;
  async function drain() {
    while (dirty && !stopped) {
      dirty = false;
      const owner = currentOwner(), version = epoch;
      if (!owner) continue;
      try {
        controller = new AbortController();
        const snapshot = await read(owner, {signal: controller.signal});
        if (!stopped && version === epoch && owner === currentOwner()) apply(snapshot, owner);
      } catch { /* Keep last confirmed value; reconnect/poll retries. Never substitute zero. */ }
      finally { controller = null; }
    }
  }
  return {
    invalidate() {
      if (stopped) return Promise.resolve();
      epoch++; dirty = true;
      controller?.abort();
      if (!running) running = drain().finally(() => { running = null; });
      return running;
    },
    stop() { stopped = true; epoch++; dirty = false; controller?.abort(); },
  };
}
