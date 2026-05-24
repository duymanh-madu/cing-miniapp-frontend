class PaymentLock {

  private locks = new Set<string>();

  acquire(id: string) {

    if (this.locks.has(id)) {
      return false;
    }

    this.locks.add(id);
    return true;

  }

  release(id: string) {
    this.locks.delete(id);
  }

}

export const paymentLock = new PaymentLock();
