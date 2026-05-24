class PaymentReliability {

  private processed = new Set<string>();

  processPayment(paymentId: string, data: any) {

    if (this.processed.has(paymentId)) {
      return { status: "DUPLICATE_IGNORED" };
    }

    this.processed.add(paymentId);

    return {
      status: "PROCESSED",
      data,
    };
  }

}

export const paymentReliability = new PaymentReliability();
