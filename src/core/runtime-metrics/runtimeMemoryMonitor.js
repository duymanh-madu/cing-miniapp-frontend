import {
  createRuntimeSafeInterval,
} from "@/runtime/timer/runtimeSafeInterval";

import runtimeTimerRegistry from "@/runtime/timer/runtimeTimerRegistry";

import useRuntimeMetricsStore from "./runtimeMetricsStore";

/**
 * =====================================================
 * RUNTIME MEMORY MONITOR
 * =====================================================
 * ENTERPRISE MEMORY GOVERNANCE
 * ZALO WEBVIEW SAFE
 * LOW-END DEVICE SAFE
 * MOBILE MEMORY SAFE
 * =====================================================
 */

class RuntimeMemoryMonitor {

  /**
   * ===================================================
   * STATE
   * ===================================================
   */

  initialized =
    false;

  cleanup =
    null;

  /**
   * ===================================================
   * MEMORY SAMPLE
   * ===================================================
   */

  sampleMemoryUsage() {

    /**
     * ===============================================
     * UNSUPPORTED
     * ===============================================
     */

    if (
      !performance?.memory
    ) {

      return;

    }

    /**
     * ===============================================
     * MEMORY SNAPSHOT
     * ===============================================
     */

    const {

      usedJSHeapSize,

      totalJSHeapSize,

      jsHeapSizeLimit,

    } = performance.memory;

    /**
     * ===============================================
     * UPDATE STORE
     * ===============================================
     */

    useRuntimeMetricsStore
      .getState()
      .setMemoryUsage({

        used:
          usedJSHeapSize,

        total:
          totalJSHeapSize,

        limit:
          jsHeapSizeLimit,

        usagePercent:
          Math.round(

            (
              usedJSHeapSize /
              jsHeapSizeLimit
            ) * 100

          ),

        sampledAt:
          Date.now(),

      });

    /**
     * ===============================================
     * MEMORY WARNING
     * ===============================================
     */

    const usageRatio =
      usedJSHeapSize /
      jsHeapSizeLimit;

    if (
      usageRatio > 0.8
    ) {

      console.warn(

        "[MEMORY MONITOR] HIGH MEMORY USAGE",

        {

          usagePercent:
            Math.round(
              usageRatio * 100
            ),

        }

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
     * SAFE INTERVAL
     * ===============================================
     */

    this.cleanup =
      createRuntimeSafeInterval({

        id:
          "runtime-memory-monitor",

        callback:
          () => {

            this.sampleMemoryUsage();

          },

        interval:
          5000,

        immediate:
          true,

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


  }

}

/**
 * =====================================================
 * SINGLETON
 * =====================================================
 */

const runtimeMemoryMonitor =
  new RuntimeMemoryMonitor();

/**
 * =====================================================
 * EXPORT
 * =====================================================
 */

export default
  runtimeMemoryMonitor;
