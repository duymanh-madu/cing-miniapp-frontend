import {
  initializeRuntimeSocket,
} from "./socket/runtimeSocketClient";

import {
  initializeRealtimeOrchestrator,
} from "./realtime/runtimeRealtimeOrchestrator";

import {
  initializeRuntimeSession,
} from "./session/runtimeSessionOrchestrator";

import {
  initializeRealtimeLoyaltyRuntime,
} from "../modules/loyalty/runtimeLoyaltyExperienceOrchestrator";

import {
  initializeMembershipCardRuntime,
} from "../modules/membership-card/runtimeMembershipCardOrchestrator";

import {
  syncRuntimeCrmCustomer,
} from "./crm/runtimeCrmSyncOrchestrator";

import {
  initializeAdminGovernanceRuntime,
} from "./admin/runtimeAdminGovernanceOrchestrator";

import {
  initializeCustomerIdentityRuntime,
} from "./customer/runtimeCustomerIdentityOrchestrator";

import {
  initializeRuntimeVisibilityLifecycle,
} from "@/runtime/lifecycle/runtimeVisibilityLifecycle";

/**
 * =====================================================
 * ENTERPRISE RUNTIME BOOTSTRAP
 * =====================================================
 * ZALO WEBVIEW HARDENED
 * MOBILE-FIRST
 * REALTIME GOVERNED
 * RESUME SAFE
 * MEMORY SAFE
 * FUTURE MOBILE APP READY
 * =====================================================
 */

/**
 * =====================================================
 * BOOTSTRAP PHASES
 * =====================================================
 */

const runtimePhases = {

  SESSION:
    "SESSION_READY",

  CUSTOMER:
    "CUSTOMER_READY",

  CRM:
    "CRM_READY",

  LOYALTY:
    "LOYALTY_READY",

  MEMBERSHIP:
    "MEMBERSHIP_READY",

  ADMIN:
    "ADMIN_READY",

  SOCKET:
    "SOCKET_READY",

  REALTIME:
    "REALTIME_READY",

  VISIBILITY:
    "VISIBILITY_READY",

  COMPLETED:
    "BOOTSTRAP_COMPLETED",

};

/**
 * =====================================================
 * RUNTIME SINGLETON LOCK
 * =====================================================
 */

let runtimeBootstrapped =
  false;

/**
 * =====================================================
 * SAFE PHASE LOGGER
 * =====================================================
 */

function logRuntimePhase(
  phase: string
) {

  runtimeLogger.info("RUNTIME", 
    `[RUNTIME] ${phase}`
  );

}

/**
 * =====================================================
 * ENTERPRISE RUNTIME BOOTSTRAP
 * =====================================================
 */

export async function bootstrapRuntime() {

  /**
   * ===================================================
   * DUPLICATE BOOTSTRAP PROTECTION
   * ===================================================
   */

  if (
    runtimeBootstrapped
  ) {

    runtimeLogger.warn("RUNTIME", 
      "[RUNTIME] ALREADY BOOTSTRAPPED"
    );

    return;

  }

  /**
   * ===================================================
   * START TIMER
   * ===================================================
   */

  const startedAt =
    performance.now();

  runtimeLogger.info("RUNTIME", 
    "[RUNTIME] BOOTSTRAP STARTED"
  );

  try {

    /**
     * =================================================
     * VISIBILITY LIFECYCLE
     * =================================================
     * MUST START EARLY
     * FOR WEBVIEW RESUME RECOVERY
     * =================================================
     */

    initializeRuntimeVisibilityLifecycle();

    logRuntimePhase(
      runtimePhases.VISIBILITY
    );

    /**
     * =================================================
     * SESSION
     * =================================================
     */

    await initializeRuntimeSession();

    logRuntimePhase(
      runtimePhases.SESSION
    );

    /**
     * =================================================
     * CUSTOMER IDENTITY
     * =================================================
     */

    await initializeCustomerIdentityRuntime();

    logRuntimePhase(
      runtimePhases.CUSTOMER
    );

    /**
     * =================================================
     * CRM HYDRATION
     * =================================================
     * TEMPORARY FALLBACK DATA
     * UNTIL LIVE CRM HYDRATION
     * IS CONNECTED
     * =================================================
     */

    await syncRuntimeCrmCustomer({

      customerId:
        "crm-demo-001",

      phone:
        "0900000000",

      fullName:
        "Cing Customer",

      totalSpent:
        6200000,

      monthlySpent:
        3200000,

      partnerTier:
        null,

      oaFollowed:
        true,

      activated:
        true,

    });

    logRuntimePhase(
      runtimePhases.CRM
    );

    /**
     * =================================================
     * LOYALTY
     * =================================================
     */

    await initializeRealtimeLoyaltyRuntime();

    logRuntimePhase(
      runtimePhases.LOYALTY
    );

    /**
     * =================================================
     * MEMBERSHIP
     * =================================================
     */

    await initializeMembershipCardRuntime();

    logRuntimePhase(
      runtimePhases.MEMBERSHIP
    );

    /**
     * =================================================
     * ADMIN GOVERNANCE
     * =================================================
     */

    await initializeAdminGovernanceRuntime();

    logRuntimePhase(
      runtimePhases.ADMIN
    );

    /**
     * =================================================
     * SOCKET
     * =================================================
     */

    initializeRuntimeSocket();

    logRuntimePhase(
      runtimePhases.SOCKET
    );

    /**
     * =================================================
     * REALTIME ORCHESTRATOR
     * =================================================
     */

    await initializeRealtimeOrchestrator();

    logRuntimePhase(
      runtimePhases.REALTIME
    );

    /**
     * =================================================
     * BOOTSTRAP LOCK
     * =================================================
     */

    runtimeBootstrapped =
      true;

    /**
     * =================================================
     * PERFORMANCE METRICS
     * =================================================
     */

    const runtimeBootMs =
      Math.round(
        performance.now() -
        startedAt
      );

    /**
     * =================================================
     * COMPLETED
     * =================================================
     */

    logRuntimePhase(
      runtimePhases.COMPLETED
    );

    runtimeLogger.info("RUNTIME", {

      runtime_boot_ms:
        runtimeBootMs,

    });

  } catch (error) {

    /**
     * =================================================
     * RESET BOOTSTRAP LOCK
     * =================================================
     */

    runtimeBootstrapped =
      false;

    /**
     * =================================================
     * LOG FAILURE
     * =================================================
     */

    runtimeLogger.error("RUNTIME", 
      "[RUNTIME] BOOTSTRAP FAILED",
      error
    );

    /**
     * =================================================
     * FUTURE SAFE MODE
     * =================================================
     * TODO:
     * - degraded runtime mode
     * - runtime self-healing
     * - low-memory recovery mode
     * - emergency offline shell
     * =================================================
     */

    throw error;

  }

}