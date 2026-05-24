/**
 * =========================================================
 * ZALO WEBVIEW MOBILE VIEWPORT SERVICE
 * =========================================================
 * Single source of truth for:
 * - iOS safe area
 * - Dynamic Island / notch spacing
 * - bottom navigation safe padding
 * - keyboard-safe viewport height
 * - Zalo WebView unstable viewport
 * =========================================================
 */

class MobileViewportService {

  initialized = false;

  rafId = null;

  init() {

    if (this.initialized) {
      return;
    }

    this.update();

    window.addEventListener(
      "resize",
      this.scheduleUpdate,
      { passive: true }
    );

    window.addEventListener(
      "orientationchange",
      this.scheduleUpdate,
      { passive: true }
    );

    document.addEventListener(
      "visibilitychange",
      this.scheduleUpdate,
      { passive: true }
    );

    window.visualViewport?.addEventListener(
      "resize",
      this.scheduleUpdate,
      { passive: true }
    );

    window.visualViewport?.addEventListener(
      "scroll",
      this.scheduleUpdate,
      { passive: true }
    );

    this.initialized = true;

  }

  scheduleUpdate = () => {

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }

    this.rafId =
      requestAnimationFrame(
        this.update
      );

  };

  update = () => {

    const root =
      document.documentElement;

    const viewportHeight =
      window.visualViewport?.height ||
      window.innerHeight;

    const viewportWidth =
      window.visualViewport?.width ||
      window.innerWidth;

    root.style.setProperty(
      "--app-height",
      `${viewportHeight}px`
    );

    root.style.setProperty(
      "--vh",
      `${viewportHeight * 0.01}px`
    );

    root.style.setProperty(
      "--app-width",
      `${viewportWidth}px`
    );

    root.style.setProperty(
      "--safe-top",
      "env(safe-area-inset-top)"
    );

    root.style.setProperty(
      "--safe-bottom",
      "env(safe-area-inset-bottom)"
    );

    root.style.setProperty(
      "--safe-left",
      "env(safe-area-inset-left)"
    );

    root.style.setProperty(
      "--safe-right",
      "env(safe-area-inset-right)"
    );

    root.style.setProperty(
      "--app-safe-top",
      "max(12px, env(safe-area-inset-top))"
    );

    root.style.setProperty(
      "--app-safe-bottom",
      "max(16px, env(safe-area-inset-bottom))"
    );

    root.style.setProperty(
      "--bottom-nav-safe-height",
      "calc(72px + var(--app-safe-bottom))"
    );

  };

}

const mobileViewportService =
  new MobileViewportService();

export default mobileViewportService;
