import behaviorRealtimeSocket from "./behaviorRealtimeSocket";

/**
 * =====================================================
 * ADMIN BEHAVIOR RUNTIME MODULE
 * =====================================================
 * Dormant until owned by a routed admin page.
 * =====================================================
 */

const behaviorRuntimeModule = {

  key:
    "admin.behavior",

  domain:
    "admin.behavior",

  priority:
    90,

  status:
    "dormant",

  dependencies:
    [],

  initialize() {

    behaviorRealtimeSocket
      .initialize();

  },

  destroy() {

    behaviorRealtimeSocket
      .destroy();

  },

  metadata: {
    owner:
      "admin",
    feature:
      "behavior",
    activation:
      "dormant-until-owned",
  },

};

export default
  behaviorRuntimeModule;
