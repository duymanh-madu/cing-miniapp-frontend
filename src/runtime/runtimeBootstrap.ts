import { initializeRuntimeSocket } from "./socket/runtimeSocketClient";
import { initializeRealtimeOrchestrator } from "./realtime/runtimeRealtimeOrchestrator";
import { initializeRuntimeStores } from "../core/store/runtimeStoreOrchestrator";
import { initializeRuntimeSession } from "./session/runtimeSessionOrchestrator";
import { syncRuntimeCrmCustomer } from "./crm/runtimeCrmSyncOrchestrator";
import { initializeCustomerIdentityRuntime } from "./customer/runtimeCustomerIdentityOrchestrator";

/**
 * RUNTIME BOOTSTRAP — chỉ giữ các module thực sự active
 * Đã loại: loyalty orchestrator, membership card orchestrator, admin governance
 * (các module này sẽ được active lại khi tích hợp iPOS CRM thật)
 */
export async function bootstrapRuntime() {
  console.log("[RUNTIME] BOOTSTRAP STARTED");

  await initializeRuntimeSession();
  await initializeRuntimeStores();
  await initializeCustomerIdentityRuntime();

  await syncRuntimeCrmCustomer({
    customerId:   "crm-demo-001",
    phone:        "0900000000",
    fullName:     "Cing Customer",
    totalSpent:   6200000,
    monthlySpent: 3200000,
    partnerTier:  null,
    oaFollowed:   true,
    activated:    true,
  });

  initializeRuntimeSocket();
  await initializeRealtimeOrchestrator();

  console.log("[RUNTIME] BOOTSTRAP COMPLETED");
}

import "@/runtime/control-plane/controlPlaneBridge";
