class CrmDistributed {

  private store = new Map<string, Map<string, any>>();

  private getStore(storeId: string) {

    if (!this.store.has(storeId)) {
      this.store.set(storeId, new Map());
    }

    return this.store.get(storeId)!;

  }

  upsert(storeId: string, customer: any) {

    const s = this.getStore(storeId);

    const existing = s.get(customer.phone);

    const merged = {
      ...existing,
      ...customer,
      storeId,
      updatedAt: Date.now(),
    };

    s.set(customer.phone, merged);

    return merged;
  }

  get(storeId: string, phone: string) {
    return this.getStore(storeId).get(phone);
  }

}

export const crmDistributed = new CrmDistributed();
