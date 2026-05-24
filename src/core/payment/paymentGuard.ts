class PaymentGuard {

  private processed = new Set<string>();

  isDuplicate(id: string) {
    return this.processed.has(id);
  }

  mark(id: string) {
    this.processed.add(id);
  }

}

export const paymentGuard = new PaymentGuard();
