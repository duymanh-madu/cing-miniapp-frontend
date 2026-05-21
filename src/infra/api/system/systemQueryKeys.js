/**
 * =========================================================
 * SYSTEM QUERY ROOT
 * =========================================================
 */

const ROOT =
  "system";

/**
 * =========================================================
 * SYSTEM QUERY KEYS
 * =========================================================
 */

export const SYSTEM_QUERY_KEYS =
  Object.freeze({

    /**
     * =====================================================
     * ROOT
     * =====================================================
     */

    ALL:
      [ROOT],

    /**
     * =====================================================
     * HEALTH
     * =====================================================
     */

    HEALTH:
      [ROOT, "health"],

    HEALTH_DETAIL:
      (type) => [

        ROOT,
        "health",
        String(type),

      ],

    /**
     * =====================================================
     * SYSTEM SNAPSHOT
     * =====================================================
     */

    SYSTEM_SNAPSHOT:
      [ROOT, "snapshot"],

    /**
     * =====================================================
     * RUNTIME
     * =====================================================
     */

    RUNTIME:
      [ROOT, "runtime"],

    RUNTIME_SECTION:
      (section) => [

        ROOT,
        "runtime",
        String(section),

      ],

    /**
     * =====================================================
     * CONFIG
     * =====================================================
     */

    CONFIG:
      [ROOT, "config"],

    CONFIG_SECTION:
      (section) => [

        ROOT,
        "config",
        String(section),

      ],

    /**
     * =====================================================
     * FEATURE FLAGS
     * =====================================================
     */

    FEATURE_FLAGS:
      [ROOT, "feature-flags"],

    FEATURE_FLAG:
      (flag) => [

        ROOT,
        "feature-flag",
        String(flag),

      ],

    /**
     * =====================================================
     * SOCKET HEALTH
     * =====================================================
     */

    SOCKET_HEALTH:
      [ROOT, "socket-health"],

    SOCKET_CHANNEL:
      (channel) => [

        ROOT,
        "socket-channel",
        String(channel),

      ],

    /**
     * =====================================================
     * REALTIME
     * =====================================================
     */

    REALTIME:
      [ROOT, "realtime"],

    REALTIME_CHANNEL:
      (channel) => [

        ROOT,
        "realtime",
        String(channel),

      ],

    /**
     * =====================================================
     * MAINTENANCE
     * =====================================================
     */

    MAINTENANCE:
      [ROOT, "maintenance"],

    /**
     * =====================================================
     * VERSION
     * =====================================================
     */

    VERSION:
      [ROOT, "version"],

    /**
     * =====================================================
     * METRICS
     * =====================================================
     */

    METRICS:
      [ROOT, "metrics"],

    METRIC:
      (metricName) => [

        ROOT,
        "metric",
        String(metricName),

      ],

    /**
     * =====================================================
     * OBSERVABILITY
     * =====================================================
     */

    OBSERVABILITY:
      [ROOT, "observability"],

    /**
     * =====================================================
     * WEBVIEW
     * =====================================================
     */

    WEBVIEW:
      [ROOT, "webview"],

    WEBVIEW_STATE:
      (state) => [

        ROOT,
        "webview",
        String(state),

      ],

    /**
     * =====================================================
     * ADMIN
     * =====================================================
     */

    ADMIN_ANALYTICS:
      [ROOT, "admin-analytics"],

    ADMIN_RUNTIME:
      [ROOT, "admin-runtime"],

  });

export default
  SYSTEM_QUERY_KEYS;