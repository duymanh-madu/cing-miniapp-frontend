import networkRuntime from "@/core/network-runtime/networkRuntime";

import useOfflineQueueStore from "@/core/offline-queue/offlineQueueStore";

class OfflineSyncRuntime {

  async synchronize({
    task,
    payload,
  }) {

    if (
      !networkRuntime.isOnline()
    ) {

      useOfflineQueueStore
        .getState()
        .enqueue({

          task,
          payload,
        });

      return;

    }

    await task(
      payload
    );

  }

}

const offlineSyncRuntime =
  new OfflineSyncRuntime();

export default
  offlineSyncRuntime;