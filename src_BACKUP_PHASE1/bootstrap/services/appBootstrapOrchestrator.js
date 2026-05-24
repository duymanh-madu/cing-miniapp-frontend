import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {

  bootstrapRuntime,
} from "@/runtime/runtimeBootstrap";

/**
 * =====================================================
 * CLEAN ENTERPRISE BOOTSTRAP
 * =====================================================
 * ZALO WEBVIEW FIRST
 * MOBILE FIRST
 * REALTIME GOVERNED
 * =====================================================
 */

let initialized =
  false;

export async function initializeApplication() {

  /**
   * ===================================================
   * SINGLETON PROTECTION
   * ===================================================
   */

  if (
    initialized
  ) {

    return;

  }

  runtimeLogger.info("APP", 
    "[BOOTSTRAP] INITIALIZING APPLICATION"
  );

  /**
   * ===================================================
   * ENTERPRISE RUNTIME
   * ===================================================
   */

  await bootstrapRuntime();

  /**
   * ===================================================
   * READY
   * ===================================================
   */

  initialized =
    true;

  runtimeLogger.info("APP", 
    "[BOOTSTRAP] APPLICATION READY"
  );

}