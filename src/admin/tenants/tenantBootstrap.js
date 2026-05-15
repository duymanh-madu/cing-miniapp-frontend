import tenantService from "./tenantService";

import useTenantStore from "./tenantStore";

class TenantBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    const [

      tenants,

      roleHierarchy,

      distributedConfig,

    ] = await Promise.all([

      tenantService
        .getTenants(),

      tenantService
        .getRoleHierarchy(),

      tenantService
        .getDistributedConfig(),

    ]);

    const store =
      useTenantStore
        .getState();

    store.setTenants(
      tenants
    );

    store.setRoleHierarchy(
      roleHierarchy
    );

    store.setDistributedConfig(
      distributedConfig
    );

    this.initialized =
      true;

  }

}

const tenantBootstrap =
  new TenantBootstrap();

export default
  tenantBootstrap;