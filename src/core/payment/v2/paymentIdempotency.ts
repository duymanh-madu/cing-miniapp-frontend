class PaymentIdempotency {

  private processed = new Set<string>();

  isProcessed(id: string) {
    return this.processed.has(id);
  }

  mark(id: string) {
    this.processed.add(id);
  }

  safeExecute(id: string, fn: () => any) {

    if (this.isProcessed(id)) {
      return { status: "DUPLICATE_BLOCKED" };
    }

    const result = fn();
    this.mark(id);

    return result;
  }

}

export const paymentIdempotency = new PaymentIdempotency();
