import {
  memo,
} from "react";

import {
  useLocation,
} from "react-router-dom";

/**
 * =====================================================
 * ROUTE TRANSITION WRAPPER
 * =====================================================
 * CSS-only WebView route shell.
 * Avoids pulling framer-motion into main customer bundle.
 * =====================================================
 */

function RouteTransitionWrapper({
  children,
}) {

  const location =
    useLocation();

  return (

    <main
      key={
        location.pathname
      }
      className="
        route-transition-shell
      "
      style={{
        minHeight:
          "calc(var(--app-height, 100dvh) - var(--bottom-nav-safe-height))",
      }}
    >

      {children}

    </main>

  );

}

export default memo(
  RouteTransitionWrapper
);
