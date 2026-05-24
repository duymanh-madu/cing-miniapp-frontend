class PaymentGuarantee {

  private processed = new Set<string>();

  async execute(paymentId: string, fn: Function) {

    if (this.processed.has(paymentId)) {
      return { status: "DUPLICATE_BLOCKED" };
    }

    const result = await fn();

    this.processed.add(paymentId);

    return result;

  }

}

export const paymentGuarantee = new PaymentGuarantee();
