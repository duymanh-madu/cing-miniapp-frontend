import apiLogger from "@/infra/api/apiLogger";
import {

  getHealthCheck,

  getRuntimeConfig,

  getSystemHealthSnapshot,

  getFeatureFlags,

  getMaintenanceStatus,

  getSocketHealth,

  getAppVersion,

} from "./systemApi";

/**
 * =========================================================
 * BOOTSTRAP PHASES
 * =========================================================
 */

export const SYSTEM_BOOT_PHASES =
  Object.freeze({

    INITIALIZING:
      "initializing",

    FETCHING:
      "fetching",

    PROCESSING:
      "processing",

    READY:
      "ready",

    DEGRADED:
      "degraded",

    FAILED:
      "failed",

  });

/**
 * =========================================================
 * SAFE RESULT
 * =========================================================
 */

function resolveSettled(
  result,
  fallback = null
) {

  return result?.status ===
    "fulfilled"

    ? result.value

    : fallback;

}

/**
 * =========================================================
 * HEALTH SCORE
 * =========================================================
 */

function calculateHealthScore({

  health,
  runtime,
  snapshot,
  socketHealth,

}) {

  let score = 100;

  if (
    !health?.success
  ) {

    score -= 40;

  }

  if (
    !runtime
  ) {

    score -= 20;

  }

  if (
    !snapshot
  ) {

    score -= 20;

  }

  if (
    !socketHealth?.connected
  ) {

    score -= 20;

  }

  return Math.max(
    0,
    score
  );

}

/**
 * =========================================================
 * BUILD BOOTSTRAP METADATA
 * =========================================================
 */

function buildBootstrapMetadata({

  startedAt,
  duration,
  phase,
  degraded,

}) {

  return {

    startedAt,

    completedAt:
      Date.now(),

    duration,

    phase,

    degraded,

    platform:
      "zalo-miniapp",

    userAgent:
      navigator.userAgent,

    online:
      navigator.onLine,

  };

}

/**
 * =========================================================
 * BOOTSTRAP SYSTEM
 * =========================================================
 */

export async function
bootstrapSystem({

  signal,

} = {}) {

  /**
   * =======================================================
   * START
   * =======================================================
   */

  const startedAt =
    Date.now();

  let phase =

    SYSTEM_BOOT_PHASES
      .INITIALIZING;

  apiLogger.log(
    "🚀 SYSTEM BOOTSTRAP START"
  );

  try {

    /**
     * =====================================================
     * FETCH PHASE
     * =====================================================
     */

    phase =

      SYSTEM_BOOT_PHASES
        .FETCHING;

    /**
     * =====================================================
     * REQUESTS
     * =====================================================
     */

    const [

      healthResult,

      runtimeResult,

      snapshotResult,

      featureFlagsResult,

      maintenanceResult,

      socketHealthResult,

      versionResult,

    ] = await Promise.allSettled([

      getHealthCheck({
        signal,
      }),

      getRuntimeConfig({
        signal,
      }),

      getSystemHealthSnapshot({
        signal,
      }),

      getFeatureFlags({
        signal,
      }),

      getMaintenanceStatus({
        signal,
      }),

      getSocketHealth({
        signal,
      }),

      getAppVersion({
        signal,
      }),

    ]);

    /**
     * =====================================================
     * PROCESS PHASE
     * =====================================================
     */

    phase =

      SYSTEM_BOOT_PHASES
        .PROCESSING;

    /**
     * =====================================================
     * RESOLVE
     * =====================================================
     */

    const health =
      resolveSettled(
        healthResult,
        {}
      );

    const runtime =
      resolveSettled(
        runtimeResult,
        {}
      );

    const snapshot =
      resolveSettled(
        snapshotResult,
        {}
      );

    const featureFlags =
      resolveSettled(
        featureFlagsResult,
        {}
      );

    const maintenance =
      resolveSettled(
        maintenanceResult,
        {
          enabled:
            false,
        }
      );

    const socketHealth =
      resolveSettled(
        socketHealthResult,
        {
          connected:
            false,
        }
      );

    const version =
      resolveSettled(
        versionResult,
        {
          version:
            "unknown",
        }
      );

    /**
     * =====================================================
     * HEALTH
     * =====================================================
     */

    const healthy =
      Boolean(
        health?.success
      );

    /**
     * =====================================================
     * DEGRADED
     * =====================================================
     */

    const degraded =

      !healthy ||

      !runtime ||

      maintenance?.enabled;

    /**
     * =====================================================
     * HEALTH SCORE
     * =====================================================
     */

    const healthScore =

      calculateHealthScore({

        health,

        runtime,

        snapshot,

        socketHealth,

      });

    /**
     * =====================================================
     * DURATION
     * =====================================================
     */

    const duration =
      Date.now() -
      startedAt;

    /**
     * =====================================================
     * FINAL PHASE
     * =====================================================
     */

    phase = degraded

      ? SYSTEM_BOOT_PHASES
          .DEGRADED

      : SYSTEM_BOOT_PHASES
          .READY;

    apiLogger.log(
      "🟢 SYSTEM BOOTSTRAP COMPLETE",
      {

        duration:
          `${duration}ms`,

        healthy,

        degraded,

        healthScore,

      }
    );

    /**
     * =====================================================
     * RETURN
     * =====================================================
     */

    return {

      success:
        true,

      healthy,

      degraded,

      healthScore,

      phase,

      duration,

      /**
       * ===============================================
       * CORE
       * ===============================================
       */

      health,

      runtime,

      snapshot,

      /**
       * ===============================================
       * FEATURES
       * ===============================================
       */

      featureFlags,

      maintenance,

      socketHealth,

      version,

      /**
       * ===============================================
       * META
       * ===============================================
       */

      metadata:

        buildBootstrapMetadata({

          startedAt,

          duration,

          phase,

          degraded,

        }),

    };

  } catch (error) {

    /**
     * =====================================================
     * FAILED
     * =====================================================
     */

    phase =

      SYSTEM_BOOT_PHASES
        .FAILED;

    const duration =
      Date.now() -
      startedAt;

    apiLogger.error(
      "❌ SYSTEM BOOTSTRAP FAILED",
      {

        duration:
          `${duration}ms`,

        message:
          error.message,

      }
    );

    /**
     * =====================================================
     * RETURN
     * =====================================================
     */

    return {

      success:
        false,

      healthy:
        false,

      degraded:
        true,

      healthScore:
        0,

      phase,

      duration,

      error:
        error.message,

      metadata:

        buildBootstrapMetadata({

          startedAt,

          duration,

          phase,

          degraded:
            true,

        }),

    };

  }

}