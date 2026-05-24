/**
 * =====================================================
 * ADMIN MODULE REGISTRY
 * =====================================================
 * Central governance layer for admin runtime modules.
 *
 * Module lifecycle:
 * - active: production-enabled
 * - dormant: available but not loaded by default
 * - deprecated: scheduled for removal
 * =====================================================
 */

class ModuleRegistry {

  modules =
    new Map();

  register({
    key,
    name,
    domain,
    status = "dormant",
    owner = "admin",
    priority = 100,
    route = null,
    bootstrap = null,
    loader = null,
    dependencies = [],
    metadata = {},
  }) {

    if (!key) {

      throw new Error(
        "Module key is required"
      );

    }

    const moduleDefinition = {
      key,
      name:
        name || key,
      domain:
        domain || "admin",
      status,
      owner,
      priority,
      route,
      bootstrap,
      loader,
      dependencies,
      metadata,
      registeredAt:
        new Date().toISOString(),
    };

    this.modules.set(
      key,
      moduleDefinition
    );

    return moduleDefinition;

  }

  get(key) {

    return this.modules.get(
      key
    );

  }

  has(key) {

    return this.modules.has(
      key
    );

  }

  getAll() {

    return Array.from(
      this.modules.values()
    ).sort(
      (a, b) =>
        a.priority - b.priority
    );

  }

  getByStatus(status) {

    return this
      .getAll()
      .filter(
        (moduleDefinition) =>
          moduleDefinition.status === status
      );

  }

  getActive() {

    return this.getByStatus(
      "active"
    );

  }

  getDormant() {

    return this.getByStatus(
      "dormant"
    );

  }

  getDeprecated() {

    return this.getByStatus(
      "deprecated"
    );

  }

  updateStatus(
    key,
    status
  ) {

    const moduleDefinition =
      this.get(key);

    if (!moduleDefinition) {

      return null;

    }

    moduleDefinition.status =
      status;

    moduleDefinition.updatedAt =
      new Date().toISOString();

    this.modules.set(
      key,
      moduleDefinition
    );

    return moduleDefinition;

  }

  clear() {

    this.modules.clear();

  }

}

const moduleRegistry =
  new ModuleRegistry();

export default moduleRegistry;
