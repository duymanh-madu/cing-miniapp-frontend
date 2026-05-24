/**
 * =========================================================
 * ZALO WEBVIEW TOUCH INTERACTION SERVICE
 * =========================================================
 * Single source of truth for mobile touch responsiveness.
 * - removes tap highlight
 * - improves perceived tap latency
 * - preserves passive scrolling
 * - avoids global preventDefault
 * =========================================================
 */

class TouchInteractionService {

  initialized = false;

  init() {

    if (this.initialized) {
      return;
    }

    const root =
      document.documentElement;

    root.style.setProperty(
      "-webkit-tap-highlight-color",
      "transparent"
    );

    root.style.setProperty(
      "touch-action",
      "manipulation"
    );

    document.addEventListener(
      "touchstart",
      this.handleTouchStart,
      {
        passive: true,
        capture: true,
      }
    );

    this.initialized = true;

  }

  handleTouchStart = () => {};

}

const touchInteractionService =
  new TouchInteractionService();

export default touchInteractionService;
