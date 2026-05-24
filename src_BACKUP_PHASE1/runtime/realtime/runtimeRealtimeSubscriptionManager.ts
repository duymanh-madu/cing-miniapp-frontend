import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

export function initializeRealtimeSubscriptions() {

  runtimeLogger.info("RUNTIME", 
    "[REALTIME] Subscriptions ready"
  );

}