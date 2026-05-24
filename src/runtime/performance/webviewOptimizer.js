/**
 * ============================================
 * WEBVIEW OPTIMIZER V1
 * ============================================
 * - reduces CPU spikes in Zalo WebView
 * - prevents background render waste
 * ============================================
 */

class WebViewOptimizer {
  constructor() {
    this.hidden = false;
  }

  init() {
    document.addEventListener("visibilitychange", () => {
      this.hidden = document.hidden;

      if (this.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
  }

  pause() {
    window.dispatchEvent(new Event("APP_PAUSE"));
  }

  resume() {
    window.dispatchEvent(new Event("APP_RESUME"));
  }
}

export default new WebViewOptimizer();