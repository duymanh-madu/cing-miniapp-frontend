import { tenantContext } from "./tenantContext";

class TenantDataRouter {

  route(data: any) {

    const tenant = tenantContext.getTenant();

    return {
      tenantId: tenant,
      data,
    };
  }

}

export const tenantDataRouter = new TenantDataRouter();
