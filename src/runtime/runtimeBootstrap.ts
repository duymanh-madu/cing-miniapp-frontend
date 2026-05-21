import {
  initializeRuntimeSocket,
} from "./socket/runtimeSocketClient";

import {
  initializeRealtimeOrchestrator,
} from "./realtime/runtimeRealtimeOrchestrator";

import {
  initializeRuntimeStores,
} from "../core/store/runtimeStoreOrchestrator"

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

/**
 * =====================================================
 * ENTERPRISE RUNTIME BOOTSTRAP
 * =====================================================
 */

export async function bootstrapRuntime() {

  console.log(
    "[RUNTIME] BOOTSTRAP STARTED"
  );

  /**
   * ===================================================
   * SESSION
   * ===================================================
   */

  await initializeRuntimeSession();

  /**
   * ===================================================
   * STORES
   * ===================================================
   */

  await initializeRuntimeStores();

  /**
   * ===================================================
   * CUSTOMER IDENTITY
   * ===================================================
   */

  await initializeCustomerIdentityRuntime();

  /**
   * ===================================================
   * CRM SYNC
   * ===================================================
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

  /**
   * ===================================================
   * LOYALTY RUNTIME
   * ===================================================
   */

  await initializeRealtimeLoyaltyRuntime();

  await initializeMembershipCardRuntime();

  /**
   * ===================================================
   * ADMIN GOVERNANCE
   * ===================================================
   */

  await initializeAdminGovernanceRuntime();

  /**
   * ===================================================
   * SOCKET
   * ===================================================
   */

  initializeRuntimeSocket();

  /**
   * ===================================================
   * REALTIME ORCHESTRATOR
   * ===================================================
   */

  await initializeRealtimeOrchestrator();

  console.log(
    "[RUNTIME] BOOTSTRAP COMPLETED"
  );

}