import indexedDbRuntime from "@/core/indexeddb/indexedDbRuntime";

import syncOrchestrator from "@/core/sync-orchestrator/syncOrchestrator";

import networkLatencyMonitor from "@/core/network-runtime/networkLatencyMonitor";

class OfflineRuntimeBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    await indexedDbRuntime
      .initialize();

    syncOrchestrator
      .initialize();

    networkLatencyMonitor
      .initialize();

    this.initialized =
      true;

  }

}

const offlineRuntimeBootstrap =
  new OfflineRuntimeBootstrap();

export default
  offlineRuntimeBootstrap;