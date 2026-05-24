import adminRealtimeAnalyticsSocket from "@/admin/realtime/adminRealtimeAnalyticsSocket";

/**
 * =====================================================
 * ADMIN ANALYTICS RUNTIME MODULE
 * =====================================================
 */

const analyticsRuntimeModule = {

  key:
    "admin.analytics",

  domain:
    "admin.analytics",

  priority:
    40,

  dependencies:
    [],

  initialize() {

    adminRealtimeAnalyticsSocket
      .initialize();

  },

  destroy() {

    adminRealtimeAnalyticsSocket
      .destroy();

  },

  metadata: {
    owner:
      "admin",
    feature:
      "analytics",
  },

};

export default
  analyticsRuntimeModule;
