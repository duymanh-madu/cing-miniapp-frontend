class PaymentGuardDistributed {

  private processed = new Map<string, string>();

  isProcessed(id: string, storeId: string) {
    return this.processed.get(id) === storeId;
  }

  mark(id: string, storeId: string) {
    this.processed.set(id, storeId);
  }

  safeExecute(id: string, storeId: string, fn: Function) {

    if (this.isProcessed(id, storeId)) {
      return { status: "DUPLICATE_BLOCKED" };
    }

    const result = fn();

    this.mark(id, storeId);

    return result;
  }

}

export const paymentGuardDistributed = new PaymentGuardDistributed();
