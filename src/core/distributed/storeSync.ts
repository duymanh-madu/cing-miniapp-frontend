class StoreSync {

  syncQueue: any[] = [];

  push(event: any) {
    this.syncQueue.push({
      ...event,
      syncedAt: Date.now(),
    });
  }

  flush() {
    const batch = [...this.syncQueue];
    this.syncQueue = [];
    return batch;
  }

}

export const storeSync = new StoreSync();
