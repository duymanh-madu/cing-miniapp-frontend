class TenantContext {

  private currentTenantId: string | null = null;

  setTenant(tenantId: string) {
    this.currentTenantId = tenantId;
  }

  getTenant() {
    return this.currentTenantId;
  }

  isMultiTenantEnabled() {
    return true;
  }

}

export const tenantContext = new TenantContext();
