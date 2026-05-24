import observabilityBootstrap from "./observabilityBootstrap";

import observabilityRealtimeSocket from "./observabilityRealtimeSocket";

/**
 * =====================================================
 * ADMIN OBSERVABILITY RUNTIME MODULE
 * =====================================================
 */

const observabilityRuntimeModule = {

  key:
    "admin.observability",

  domain:
    "admin.observability",

  priority:
    30,

  dependencies:
    [],

  async initialize() {

    await observabilityBootstrap
      .bootstrap();

    observabilityRealtimeSocket
      .initialize();

  },

  async destroy() {

    observabilityRealtimeSocket
      .destroy();

  },

  metadata: {
    owner:
      "admin",
    feature:
      "observability",
  },

};

export default
  observabilityRuntimeModule;
