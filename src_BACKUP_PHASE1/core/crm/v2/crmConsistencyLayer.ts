class CrmConsistencyLayer {

  private store = new Map<string, any>();

  upsert(customer: any) {

    const existing = this.store.get(customer.phone);

    const merged = {
      ...existing,
      ...customer,
      updatedAt: Date.now(),
    };

    this.store.set(customer.phone, merged);

    return merged;
  }

  get(phone: string) {
    return this.store.get(phone);
  }

  all() {
    return Array.from(this.store.values());
  }

}

export const crmConsistencyLayer = new CrmConsistencyLayer();
