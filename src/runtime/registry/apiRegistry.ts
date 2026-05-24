class ApiRegistry {

  private apis = new Map<string, any>();

  register(name: string, meta: any) {
    this.apis.set(name, {
      ...meta,
      registeredAt: Date.now(),
    });
  }

  getAll() {
    return Array.from(this.apis.entries()).map(([name, value]) => ({
      name,
      ...value,
    }));
  }

}

export const apiRegistry = new ApiRegistry();
