class CrmCore {

  private store = new Map<string, any>();

  upsert(customer: any) {
    this.store.set(customer.phone, {
      ...customer,
      updatedAt: Date.now(),
    });
  }

  get(phone: string) {
    return this.store.get(phone);
  }

}

export const crmCore = new CrmCore();
