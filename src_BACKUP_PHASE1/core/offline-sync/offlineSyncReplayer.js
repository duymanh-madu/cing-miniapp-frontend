import useOfflineQueueStore from "@/core/offline-queue/offlineQueueStore";

class OfflineSyncReplayer {

  async replay() {

    const store =
      useOfflineQueueStore
        .getState();

    store.setProcessing(
      true
    );

    for (
      const item
      of store.queue
    ) {

      try {

        await item.task(
          item.payload
        );

        store.dequeue();

      } catch (
        error
      ) {

        store.appendFailed({
          item,
          error,
        });

      }

    }

    store.setProcessing(
      false
    );

  }

}

const offlineSyncReplayer =
  new OfflineSyncReplayer();

export default
  offlineSyncReplayer;