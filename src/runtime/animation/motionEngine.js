/**
 * ============================================
 * MOTION ENGINE V5 (ESPORTS CORE)
 * ============================================
 */

class MotionEngine {
  constructor() {
    this.listeners = new Set();
  }

  subscribe(fn) {
    this.listeners.add(fn);
  }

  emit(event) {
    this.listeners.forEach((fn) => fn(event));
  }

  rankUp(user) {
    this.emit({
      type: "RANK_UP",
      user,
    });
  }

  top1(user) {
    this.emit({
      type: "TOP_1",
      user,
    });
  }
}

export default new MotionEngine();