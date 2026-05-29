import { initializeRuntimeSocket }           from "./socket/runtimeSocketClient";
import { initializeRealtimeOrchestrator }    from "./realtime/runtimeRealtimeOrchestrator";
import { initializeRuntimeStores }           from "../core/store/runtimeStoreOrchestrator";
import { initializeRuntimeSession }          from "./session/runtimeSessionOrchestrator";
import { initializeCustomerIdentityRuntime } from "./customer/runtimeCustomerIdentityOrchestrator";

export async function bootstrapRuntime() {
  console.log("[RUNTIME] BOOTSTRAP STARTED");
  await initializeRuntimeSession();
  await initializeRuntimeStores();
  await initializeCustomerIdentityRuntime();
  initializeRuntimeSocket();
  await initializeRealtimeOrchestrator();
  console.log("[RUNTIME] BOOTSTRAP COMPLETED");
}

import "@/runtime/control-plane/controlPlaneBridge";
