import { tenantContext } from "./tenantContext";

export function bootstrapTenantSystem() {

  // default single store mode
  tenantContext.setTenant("DEFAULT_STORE");

}
