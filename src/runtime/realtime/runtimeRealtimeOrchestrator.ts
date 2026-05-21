import {
  initializeRealtimeSubscriptions,
} from "./runtimeRealtimeSubscriptionManager";

export function initializeRealtimeOrchestrator() {

  console.log(
    "[REALTIME] Initializing orchestrator"
  );

  initializeRealtimeSubscriptions();

  console.log(
    "[REALTIME] Orchestrator ready"
  );

}