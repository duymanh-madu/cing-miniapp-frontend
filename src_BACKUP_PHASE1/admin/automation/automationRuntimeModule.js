import automationRealtimeSocket from "./automationRealtimeSocket";

/**
 * =====================================================
 * ADMIN AUTOMATION RUNTIME MODULE
 * =====================================================
 */

const automationRuntimeModule = {

  key:
    "admin.automation",

  domain:
    "admin.automation",

  priority:
    20,

  dependencies:
    [],

  initialize() {

    automationRealtimeSocket
      .initialize();

  },

  destroy() {

    automationRealtimeSocket
      .destroy();

  },

  metadata: {
    owner:
      "admin",
    feature:
      "automation",
  },

};

export default
  automationRuntimeModule;
