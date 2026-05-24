/**
 * =====================================================
 * ENTERPRISE ROUTE PRELOADER
 * =====================================================
 * ZALO WEBVIEW OPTIMIZED
 * MOBILE-FIRST
 * INSTANT PAGE TRANSITION
 * =====================================================
 */

class RoutePreloader {

  preload() {

    /**
     * ===================================================
     * PRIMARY RUNTIME ROUTES
     * ===================================================
     */

    import("@/features/menu");

    import("@/features/game");

    import("@/features/account");

    import("@/features/leaderboard");

    /**
     * ===================================================
     * SECONDARY RUNTIME ROUTES
     * ===================================================
     * delayed warm preload
     * ===================================================
     */

    requestIdleCallback?.(() => {

      import("@/pages/HomePage");

    });

  }

}

const routePreloader =
  new RoutePreloader();

export default
  routePreloader;
