import {
  createRuntimeSafeInterval,
} from "@/runtime/timer/runtimeSafeInterval";

import runtimeTimerRegistry from "@/runtime/timer/runtimeTimerRegistry";

import {
  clearRealtimeCache,
} from "../cache/lightweightRealtimeCache";

/**
 * =====================================================
 * MEMORY CLEANUP ENGINE
 * =====================================================
 * ENTERPRISE MEMORY GOVERNANCE
 * ZALO WEBVIEW SAFE
 * LOW-END DEVICE SAFE
 * MOBILE MEMORY SAFE
 * =====================================================
 */

class MemoryCleanupEngine {

  /**
   * ===================================================
   * STATE
   * ===================================================
   */

  initialized =
    false;

  cleanup =
    null;

  lastCleanupAt =
    null;

  cleanupCount =
    0;

  /**
   * ===================================================
   * EXECUTE CLEANUP
   * ===================================================
   */

  executeCleanup() {

    try {

      /**
       * ===============================================
       * CLEAR CACHE
       * ===============================================
       */

      clearRealtimeCache();

      /**
       * ===============================================
       * METRICS
       * ===============================================
       */

      this.lastCleanupAt =
        Date.now();

      this.cleanupCount +=
        1;

      /**
       * ===============================================
       * LOG
       * ===============================================
       */

      console.log(

        "[MEMORY CLEANUP] COMPLETED",

        {

          cleanupCount:
            this.cleanupCount,

        }

      );

    } catch (
      error
    ) {

      console.error(

        "[MEMORY CLEANUP ERROR]",

        error

      );

    }

  }

  /**
   * ===================================================
   * INITIALIZE
   * ===================================================
   */

  initialize() {

    /**
     * ===============================================
     * SINGLETON PROTECTION
     * ===============================================
     */

    if (
      this.initialized
    ) {

      return;

    }

    /**
     * ===============================================
     * SAFE CLEANUP LOOP
     * ===============================================
     */

    this.cleanup =
      createRuntimeSafeInterval({

        id:
          "memory-cleanup-engine",

        callback:
          () => {

            this.executeCleanup();

          },

        interval:
          60000,

        immediate:
          false,

        visibilityAware:
          true,

        autoCleanup:
          true,

      });

    /**
     * ===============================================
     * READY
     * ===============================================
     */

    this.initialized =
      true;

    console.log(
      "[MEMORY CLEANUP] INITIALIZED"
    );

  }

  /**
   * ===================================================
   * METRICS
   * ===================================================
   */

  getMetrics() {

    return {

      initialized:
        this.initialized,

      cleanupCount:
        this.cleanupCount,

      lastCleanupAt:
        this.lastCleanupAt,

      timers:
        runtimeTimerRegistry
          .getMetrics(),

    };

  }

  /**
   * ===================================================
   * DESTROY
   * ===================================================
   */

  destroy() {

    /**
     * ===============================================
     * CLEANUP TIMER
     * ===============================================
     */

    if (
      this.cleanup
    ) {

      this.cleanup();

    }

    /**
     * ===============================================
     * RESET
     * ===============================================
     */

    this.cleanup =
      null;

    this.initialized =
      false;

    console.log(
      "[MEMORY CLEANUP] DESTROYED"
    );

  }

}

/**
 * =====================================================
 * SINGLETON
 * =====================================================
 */

const memoryCleanupEngine =
  new MemoryCleanupEngine();

/**
 * =====================================================
 * EXPORTS
 * =====================================================
 */

export function initializeMemoryCleanup() {

  memoryCleanupEngine
    .initialize();

}

export function destroyMemoryCleanup() {

  memoryCleanupEngine
    .destroy();

}

export function getMemoryCleanupMetrics() {

  return memoryCleanupEngine
    .getMetrics();

}

export default
  memoryCleanupEngine;