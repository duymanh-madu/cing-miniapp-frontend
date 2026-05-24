class StoreRegistry {

  private stores = new Map<string, any>();

  register(storeId: string, config: any) {
    this.stores.set(storeId, config);
  }

  get(storeId: string) {
    return this.stores.get(storeId);
  }

  list() {
    return Array.from(this.stores.keys());
  }

}

export const storeRegistry = new StoreRegistry();
