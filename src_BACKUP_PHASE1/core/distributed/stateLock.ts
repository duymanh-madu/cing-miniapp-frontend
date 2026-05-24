class StateLock {

  private locks = new Map<string, number>();

  acquire(key: string) {

    const now = Date.now();

    if (this.locks.has(key)) {
      const last = this.locks.get(key)!;

      // prevent concurrent cross-instance write
      if (now - last < 500) {
        return false;
      }
    }

    this.locks.set(key, now);
    return true;

  }

}

export const stateLock = new StateLock();
