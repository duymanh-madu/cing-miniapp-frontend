import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {
  initializeCustomerIdentityRuntime,
} from "@/runtime/customer/runtimeCustomerIdentityOrchestrator";

import {
  useRuntimeCustomerIdentityStore,
} from "@/runtime/customer/runtimeCustomerIdentityStore";

/**
 * =====================================================
 * ZALO ACTIVATION RUNTIME COMPATIBILITY BRIDGE
 * =====================================================
 * Source of truth:
 *   runtime/customer/runtimeCustomerIdentityEngine
 *
 * This file must not call activation API directly.
 * It exists only for legacy imports.
 * =====================================================
 */

class ActivationRuntime {

  async activate() {

    runtimeLogger.info(
      "ZALO",
      "[ACTIVATION] Delegating to customer identity runtime"
    );

    await initializeCustomerIdentityRuntime();

    return useRuntimeCustomerIdentityStore
      .getState()
      .identity;

  }

}

const activationRuntime =
  new ActivationRuntime();

export default activationRuntime;
