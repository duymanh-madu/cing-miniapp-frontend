/**
 * ============================================
 * WEBVIEW PERFORMANCE GUARD (ZALO OPTIMIZED)
 * ============================================
 */

class WebViewGuard {
  constructor() {
    this.hidden = false;
  }

  init() {
    document.addEventListener("visibilitychange", () => {
      this.hidden = document.hidden;

      if (this.hidden) {
        window.dispatchEvent(new Event("APP_PAUSE"));
      } else {
        window.dispatchEvent(new Event("APP_RESUME"));
      }
    });
  }
}

export default new WebViewGuard();