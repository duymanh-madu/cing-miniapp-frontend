/**
 * =====================================================
 * RUNTIME SAFE TIMEOUT
 * =====================================================
 * ENTERPRISE TIMER GOVERNANCE
 * ZALO WEBVIEW SAFE
 * MOBILE MEMORY SAFE
 * VISIBILITY AWARE
 * =====================================================
 */

import runtimeTimerRegistry from "./runtimeTimerRegistry";
import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";


/**
 * =====================================================
 * TYPES
 * =====================================================
 */

export interface RuntimeSafeTimeoutOptions {

  id:
    string;

  callback:
    () => void;

  timeout:
    number;

  visibilityAware?:
    boolean;

  autoCleanup?:
    boolean;

}

/**
 * =====================================================
 * CREATE SAFE TIMEOUT
 * =====================================================
 */

export function createRuntimeSafeTimeout({

  id,

  callback,

  timeout,

  visibilityAware =
    true,

  autoCleanup =
    true,

}: RuntimeSafeTimeoutOptions) {

  /**
   * ===================================================
   * DUPLICATE PROTECTION
   * ===================================================
   */

  runtimeTimerRegistry
    .clearTimeout(
      id
    );

  /**
   * ===================================================
   * EXECUTE
   * ===================================================
   */

  const execute =
    () => {

      /**
       * ===============================================
       * VISIBILITY GOVERNANCE
       * ===============================================
       */

      if (

        visibilityAware &&

        typeof document !==
          "undefined" &&

        document.visibilityState !==
          "visible"

      ) {

        return;

      }

      /**
       * ===============================================
       * EXECUTE CALLBACK
       * ===============================================
       */

      try {

        callback();

      } catch (
        error
      ) {

        runtimeLogger.error("RUNTIME", 

          "[SAFE TIMEOUT ERROR]",

          {
            id,
            error,
          }

        );

      } finally {

        /**
         * =============================================
         * AUTO CLEANUP
         * =============================================
         */

        if (
          autoCleanup
        ) {

          runtimeTimerRegistry
            .clearTimeout(
              id
            );

        }

      }

    };

  /**
   * ===================================================
   * CREATE TIMEOUT
   * ===================================================
   */

  const timer =
    globalThis.setTimeout(

      execute,

      timeout

    );

  /**
   * ===================================================
   * REGISTER
   * ===================================================
   */

  runtimeTimerRegistry
    .registerTimeout(

      id,

      timer,

      {

        visibilityAware,

        autoCleanup,

      }

    );

  /**
   * ===================================================
   * CLEANUP
   * ===================================================
   */

  return () => {

    runtimeTimerRegistry
      .clearTimeout(
        id
      );

  };

}

/**
 * =====================================================
 * EXPORT
 * =====================================================
 */

export default
  createRuntimeSafeTimeout;