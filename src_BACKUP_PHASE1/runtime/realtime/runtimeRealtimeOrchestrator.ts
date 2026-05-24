import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {

  initializeRealtimeSubscriptions,
} from "./runtimeRealtimeSubscriptionManager";

export function initializeRealtimeOrchestrator() {

  runtimeLogger.info("RUNTIME", 
    "[REALTIME] Initializing orchestrator"
  );

  initializeRealtimeSubscriptions();

  runtimeLogger.info("RUNTIME", 
    "[REALTIME] Orchestrator ready"
  );

}