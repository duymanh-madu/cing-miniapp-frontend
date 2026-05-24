import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {
  useRuntimeCustomerIdentityStore,
} from "@/runtime/customer/runtimeCustomerIdentityStore";

/**
 * =====================================================
 * RUNTIME AUTH HYDRATOR
 * =====================================================
 * Canonical identity owner:
 *   runtime/customer/runtimeCustomerIdentityStore
 * =====================================================
 */

export function hydrateRuntimeIdentity() {

  useRuntimeCustomerIdentityStore
    .getState()
    .resetIdentity();

  runtimeLogger.info(
    "RUNTIME",
    "[IDENTITY] Runtime customer identity awaiting activation"
  );

}
