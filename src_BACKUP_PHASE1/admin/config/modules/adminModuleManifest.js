/**
 * =====================================================
 * ADMIN MODULE MANIFEST
 * =====================================================
 * Source of truth for admin runtime governance.
 * =====================================================
 */

const adminModuleManifest = [

  /**
   * ===================================================
   * ACTIVE PRODUCTION MODULES
   * ===================================================
   */

  {
    key: "orders",
    name: "Orders",
    domain: "commerce",
    status: "active",
    priority: 10,
  },

  {
    key: "payments",
    name: "Payments",
    domain: "commerce",
    status: "active",
    priority: 20,
  },

  {
    key: "ipos",
    name: "iPOS Runtime",
    domain: "integration",
    status: "active",
    priority: 30,
  },

  {
    key: "customer360",
    name: "Customer 360",
    domain: "crm",
    status: "active",
    priority: 40,
  },

  {
    key: "config",
    name: "Runtime Config",
    domain: "runtime",
    status: "active",
    priority: 50,
  },

  /**
   * ===================================================
   * DORMANT ENTERPRISE MODULES
   * ===================================================
   */

  {
    key: "ecosystem",
    name: "Ecosystem",
    domain: "enterprise",
    status: "dormant",
    priority: 200,
  },

  {
    key: "ai-runtime",
    name: "AI Runtime",
    domain: "ai",
    status: "dormant",
    priority: 210,
  },

  {
    key: "ai-agents",
    name: "AI Agents",
    domain: "ai",
    status: "dormant",
    priority: 220,
  },

  {
    key: "federation",
    name: "Federation",
    domain: "enterprise",
    status: "dormant",
    priority: 230,
  },

  {
    key: "distribution",
    name: "Distribution",
    domain: "enterprise",
    status: "dormant",
    priority: 240,
  },

  /**
   * ===================================================
   * DEPRECATED
   * ===================================================
   */

];

export default adminModuleManifest;
