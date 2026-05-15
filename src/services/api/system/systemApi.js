import httpClient from "@/services/http/httpClient";

import {
  resolveHttpError,
} from "@/services/http/httpErrorHandler";

/**
 * =========================================================
 * SYSTEM API ENDPOINTS
 * =========================================================
 */

export const SYSTEM_API_ENDPOINTS =
  Object.freeze({

    HEALTH:
      "/api/health",

    SYSTEM_HEALTH:
      "/health/system",

    RUNTIME_CONFIG:
      "/api/runtime/config",

    FEATURE_FLAGS:
      "/api/runtime/features",

    SYSTEM_METRICS:
      "/api/runtime/metrics",

    SOCKET_HEALTH:
      "/api/runtime/socket-health",

    MAINTENANCE:
      "/api/runtime/maintenance",

    VERSION:
      "/api/runtime/version",

  });

/**
 * =========================================================
 * SAFE REQUEST
 * =========================================================
 */

async function safeRequest({

  url,
  method = "get",
  params,
  data,
  signal,
  fallback = {},

}) {

  try {

    /**
     * =====================================================
     * REQUEST
     * =====================================================
     */

    const response =
      await httpClient({

        url,

        method,

        params,

        data,

        signal,

      });

    /**
     * =====================================================
     * RESPONSE
     * =====================================================
     */

    return (

      response?.data ??

      fallback

    );

  } catch (error) {

    /**
     * =====================================================
     * PARSE
     * =====================================================
     */

    const parsedError =
      resolveHttpError(
        error
      );

    /**
     * =====================================================
     * LOG
     * =====================================================
     */

    console.error(
      "❌ SYSTEM API ERROR",
      {

        url,

        method,

        message:
          parsedError.message,

        status:
          parsedError.status,

      }
    );

    /**
     * =====================================================
     * THROW
     * =====================================================
     */

    throw parsedError;

  }

}

/**
 * =========================================================
 * GET HEALTH CHECK
 * =========================================================
 */

export async function
getHealthCheck({

  signal,

} = {}) {

  return safeRequest({

    url:

      SYSTEM_API_ENDPOINTS
        .HEALTH,

    signal,

    fallback: {

      success:
        false,

      service:
        "unknown",

    },

  });

}

/**
 * =========================================================
 * GET SYSTEM HEALTH SNAPSHOT
 * =========================================================
 */

export async function
getSystemHealthSnapshot({

  signal,

} = {}) {

  return safeRequest({

    url:

      SYSTEM_API_ENDPOINTS
        .SYSTEM_HEALTH,

    signal,

    fallback: {

      healthy:
        false,

    },

  });

}

/**
 * =========================================================
 * GET RUNTIME CONFIG
 * =========================================================
 */

export async function
getRuntimeConfig({

  signal,

} = {}) {

  return safeRequest({

    url:

      SYSTEM_API_ENDPOINTS
        .RUNTIME_CONFIG,

    signal,

    fallback: {},

  });

}

/**
 * =========================================================
 * GET FEATURE FLAGS
 * =========================================================
 */

export async function
getFeatureFlags({

  signal,

} = {}) {

  return safeRequest({

    url:

      SYSTEM_API_ENDPOINTS
        .FEATURE_FLAGS,

    signal,

    fallback: {},

  });

}

/**
 * =========================================================
 * GET SYSTEM METRICS
 * =========================================================
 */

export async function
getSystemMetrics({

  signal,

} = {}) {

  return safeRequest({

    url:

      SYSTEM_API_ENDPOINTS
        .SYSTEM_METRICS,

    signal,

    fallback: {},

  });

}

/**
 * =========================================================
 * GET SOCKET HEALTH
 * =========================================================
 */

export async function
getSocketHealth({

  signal,

} = {}) {

  return safeRequest({

    url:

      SYSTEM_API_ENDPOINTS
        .SOCKET_HEALTH,

    signal,

    fallback: {

      connected:
        false,

    },

  });

}

/**
 * =========================================================
 * GET MAINTENANCE STATUS
 * =========================================================
 */

export async function
getMaintenanceStatus({

  signal,

} = {}) {

  return safeRequest({

    url:

      SYSTEM_API_ENDPOINTS
        .MAINTENANCE,

    signal,

    fallback: {

      enabled:
        false,

    },

  });

}

/**
 * =========================================================
 * GET APP VERSION
 * =========================================================
 */

export async function
getAppVersion({

  signal,

} = {}) {

  return safeRequest({

    url:

      SYSTEM_API_ENDPOINTS
        .VERSION,

    signal,

    fallback: {

      version:
        "unknown",

    },

  });

}