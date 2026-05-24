class EventThrottle {

  private lastRun = new Map<string, number>();

  canRun(event: string, delay = 300) {

    const now = Date.now();
    const last = this.lastRun.get(event) || 0;

    if (now - last < delay) {
      return false;
    }

    this.lastRun.set(event, now);
    return true;
  }

}

export const eventThrottle = new EventThrottle();
