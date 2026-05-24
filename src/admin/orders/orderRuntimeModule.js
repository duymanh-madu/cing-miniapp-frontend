import orderBootstrap from "./orderBootstrap";

import orderRealtimeSocket from "./orderRealtimeSocket";

/**
 * =====================================================
 * ADMIN ORDERS RUNTIME MODULE
 * =====================================================
 * Runtime orchestrator ownership wrapper.
 * =====================================================
 */

const orderRuntimeModule = {

  key:
    "admin.orders",

  domain:
    "admin.orders",

  priority:
    10,

  dependencies:
    [],

  async initialize() {

    await orderBootstrap
      .bootstrap();

    orderRealtimeSocket
      .initialize();

  },

  async destroy() {

    orderRealtimeSocket
      .destroy();

  },

  metadata: {
    owner:
      "admin",
    feature:
      "orders",
  },

};

export default
  orderRuntimeModule;
