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

  // Chỉ reset nếu chưa có zaloUserId từ shell
  const store = useRuntimeCustomerIdentityStore.getState();
  if (!store.identity?.zaloUserId) {
    store.resetIdentity();
  }

  runtimeLogger.info(
    "RUNTIME",
    "[IDENTITY] Runtime customer identity awaiting activation"
  );

}
