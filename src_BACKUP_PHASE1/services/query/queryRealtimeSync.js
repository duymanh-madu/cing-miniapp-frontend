import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

/**
 * =====================================================
 * QUERY REALTIME SYNC
 * =====================================================
 * ENTERPRISE PLACEHOLDER
 * =====================================================
 */

class QueryRealtimeSync {

  initialized =
    false;

  register() {

    if (
      this.initialized
    ) {

      return;

    }

    runtimeLogger.info("APP", 
      "[QUERY REALTIME] REGISTERED"
    );

    this.initialized =
      true;

  }

}

const queryRealtimeSync =
  new QueryRealtimeSync();

export default
  queryRealtimeSync;