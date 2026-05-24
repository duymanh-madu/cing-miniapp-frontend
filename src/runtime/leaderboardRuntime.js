/**
 * ============================================
 * LEADERBOARD RUNTIME V4 (PRODUCTION FINAL)
 * ============================================
 * - RAF batched updates (no UI spam)
 * - Subscriber safe lifecycle
 * - Max size protection (TOP 100)
 * - Immutable update pattern
 * - WebView performance safe
 * ============================================
 */

class LeaderboardRuntime {
  constructor() {
    this.entries = [];
    this.subscribers = new Set();

    // render batching
    this._pending = false;
  }

  /**
   * UPDATE LEADERBOARD (SAFE BATCHED)
   */
  update(entries) {
    if (!Array.isArray(entries)) return;

    // always normalize max 100
    const normalized = entries
      .slice()
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 100);

    this.entries = normalized;

    this._scheduleNotify();
  }

  /**
   * RAF BATCH NOTIFY (PREVENT UI SPAM)
   */
  _scheduleNotify() {
    if (this._pending) return;

    this._pending = true;

    requestAnimationFrame(() => {
      this._pending = false;
      this._notify();
    });
  }

  /**
   * NOTIFY ALL SUBSCRIBERS
   */
  _notify() {
    this.subscribers.forEach((fn) => {
      try {
        fn(this.entries);
      } catch (err) {
        console.error("[Leaderboard Subscriber Error]", err);
      }
    });
  }

  /**
   * SUBSCRIBE (SAFE)
   */
  subscribe(fn) {
    if (typeof fn !== "function") return () => {};

    this.subscribers.add(fn);

    // immediate sync
    fn(this.entries);

    return () => {
      this.subscribers.delete(fn);
    };
  }

  /**
   * GET TOP N
   */
  getTop(n = 100) {
    return this.entries.slice(0, n);
  }

  /**
   * RESET (optional safe use)
   */
  reset() {
    this.entries = [];
    this._scheduleNotify();
  }
}

export default new LeaderboardRuntime();