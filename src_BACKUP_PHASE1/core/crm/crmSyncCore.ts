class CrmSyncCore {

  private customers = new Map<string, any>();

  sync(customer: any) {
    this.customers.set(customer.phone, {
      ...customer,
      syncedAt: Date.now(),
    });

    return this.customers.get(customer.phone);
  }

  get(phone: string) {
    return this.customers.get(phone);
  }

}

export const crmSyncCore = new CrmSyncCore();
