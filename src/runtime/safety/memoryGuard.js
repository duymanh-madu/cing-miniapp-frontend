/**
 * ============================================
 * MEMORY GUARD V1
 * ============================================
 */

class MemoryGuard {
  constructor() {
    this.timers = new Set();
  }

  addInterval(id) {
    this.timers.add(id);
  }

  clearAll() {
    this.timers.forEach(clearInterval);
    this.timers.clear();
  }
}

export default new MemoryGuard();