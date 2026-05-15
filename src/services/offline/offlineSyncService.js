import networkStateManager from "@/services/offline/networkStateManager";

import offlineMutationQueue from "@/services/offline/offlineMutationQueue";

/**
 * =========================================================
 * OFFLINE SYNC SERVICE
 * =========================================================
 */

class OfflineSyncService {
  initialized = false;

  init() {
    if (this.initialized) {
      return;
    }

    networkStateManager.subscribe(
      async (online) => {
        if (!online) {
          return;
        }

        await offlineMutationQueue.flush();
      }
    );

    this.initialized = true;
  }
}

const offlineSyncService =
  new OfflineSyncService();

export default offlineSyncService;