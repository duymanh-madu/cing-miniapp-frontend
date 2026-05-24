/**
 * ============================================
 * EVENT BUS V3 (UNIFIED SYSTEM CORE)
 * ============================================
 */

class EventBus {
  constructor() {
    this.events = new Map();
  }

  on(event, fn) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }

    this.events.get(event).add(fn);
  }

  off(event, fn) {
    this.events.get(event)?.delete(fn);
  }

  emit(event, payload) {
    this.events.get(event)?.forEach((fn) => fn(payload));
  }
}

export default new EventBus();