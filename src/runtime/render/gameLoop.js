/**
 * ============================================
 * GAME LOOP ENGINE V5 (PRODUCTION FINAL)
 * ============================================
 * - Stable FPS (mobile WebView safe)
 * - Pause/Resume lifecycle aware
 * - Delta time clamped (anti spike)
 * - Visibility API support
 * - Memory-safe RAF loop
 * ============================================
 */

class GameLoop {
  constructor() {
    this.running = false;
    this.lastTime = 0;
    this.rafId = null;
    this.updateFn = null;

    // FPS safety
    this.targetFPS = 60;
    this.frameInterval = 1000 / this.targetFPS;

    // lifecycle state
    this.isVisible = true;

    this._bindVisibility();
  }

  /**
   * START LOOP
   */
  start(updateFn) {
    if (typeof updateFn !== "function") return;

    this.updateFn = updateFn;
    this.running = true;
    this.lastTime = performance.now();

    this.loop();
  }

  /**
   * MAIN LOOP
   */
  loop = () => {
    if (!this.running) return;

    this.rafId = requestAnimationFrame(this.loop);

    const now = performance.now();
    const delta = now - this.lastTime;

    // FPS throttle (prevent overload)
    if (delta < this.frameInterval) return;

    this.lastTime = now;

    // clamp delta (prevent spiral of death)
    const safeDelta = Math.min(delta, 50);

    try {
      this.updateFn?.(safeDelta);
    } catch (err) {
      console.error("[GameLoop Error]", err);
    }
  };

  /**
   * STOP LOOP COMPLETELY
   */
  stop() {
    this.running = false;

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * PAUSE (keep state)
   */
  pause() {
    this.running = false;
  }

  /**
   * RESUME SAFE
   */
  resume() {
    if (this.running) return;

    this.running = true;
    this.lastTime = performance.now();
    this.loop();
  }

  /**
   * HANDLE TAB / WEBVIEW VISIBILITY
   */
  _bindVisibility() {
    document.addEventListener("visibilitychange", () => {
      this.isVisible = !document.hidden;

      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
  }
}

export default new GameLoop();