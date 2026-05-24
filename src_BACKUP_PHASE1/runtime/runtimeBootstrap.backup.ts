import { initializeRuntimeSocket } from "./socket/runtimeSocketClient";
import { initializeRealtimeOrchestrator } from "./realtime/runtimeRealtimeOrchestrator";
import { initializeRuntimeSession } from "./session/runtimeSessionOrchestrator";
import { initializeRealtimeLoyaltyRuntime } from "../modules/loyalty/runtimeLoyaltyExperienceOrchestrator";
import { initializeMembershipCardRuntime } from "../modules/membership-card/runtimeMembershipCardOrchestrator";
import { syncRuntimeCrmCustomer } from "./crm/runtimeCrmSyncOrchestrator";
import { initializeAdminGovernanceRuntime } from "./admin/runtimeAdminGovernanceOrchestrator";
import { initializeCustomerIdentityRuntime } from "./customer/runtimeCustomerIdentityOrchestrator";
import { initializeRuntimeVisibilityLifecycle } from "@/runtime/lifecycle/runtimeVisibilityLifecycle";
import { runtimeLogger } from "@/runtime/logger/runtimeLogger";

/**
 * =====================================================
 * SAFE EXECUTOR (GLOBAL SCOPE - FIXED)
 * =====================================================
 */
async function safeExecute(
  phase: string,
  fn?: () => Promise<any> | any
) {
  if (!fn) {
    runtimeLogger.error("RUNTIME", `[${phase}] MISSING FUNCTION`);
    return;
  }

  try {
    await fn();
    runtimeLogger.info("RUNTIME", `[${phase}] OK`);
  } catch (error) {
    runtimeLogger.error("RUNTIME", `[${phase}] FAILED`, error);
  }
}

/**
 * =====================================================
 * BOOTSTRAP
 * =====================================================
 */
export async function bootstrapRuntime() {

  const startedAt = performance.now();

  let runtimeBootstrapped = false;

  try {

    await safeExecute("SESSION", initializeRuntimeSession);

    await safeExecute("CUSTOMER", initializeCustomerIdentityRuntime);

    await safeExecute(
  "CRM",
  () => syncRuntimeCrmCustomer(undefined as any)
);

    await safeExecute("LOYALTY", initializeRealtimeLoyaltyRuntime);

    await safeExecute("MEMBERSHIP", initializeMembershipCardRuntime);

    await safeExecute("ADMIN", initializeAdminGovernanceRuntime);

    await safeExecute("SOCKET", initializeRuntimeSocket);

    await safeExecute("REALTIME", initializeRealtimeOrchestrator);

    await safeExecute("VISIBILITY", initializeRuntimeVisibilityLifecycle);

    runtimeBootstrapped = true;

    const runtimeBootMs =
      Math.round(performance.now() - startedAt);

    runtimeLogger.info("RUNTIME", {
      status: "BOOTSTRAP_COMPLETED",
      runtime_boot_ms: runtimeBootMs,
    });

  } catch (error) {

    runtimeLogger.error(
      "RUNTIME",
      "[BOOTSTRAP CRITICAL ERROR]",
      error
    );

    runtimeBootstrapped = false;

    // ❗ KHÔNG throw để tránh crash app
  }
}