class PaymentReconciliation {

  private ledger = new Map<string, any>();

  record(paymentId: string, data: any) {

    if (this.ledger.has(paymentId)) {
      return this.ledger.get(paymentId); // idempotency protection
    }

    const record = {
      ...data,
      status: "RECORDED",
      timestamp: Date.now(),
    };

    this.ledger.set(paymentId, record);

    return record;
  }

  reconcile(paymentId: string) {
    const record = this.ledger.get(paymentId);
    if (!record) return null;

    record.status = "RECONCILED";
    record.reconciledAt = Date.now();

    this.ledger.set(paymentId, record);

    return record;
  }

}

export const paymentReconciliation = new PaymentReconciliation();
