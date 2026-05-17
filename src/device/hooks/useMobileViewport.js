import {
  useEffect,
} from "react";

import {
  applySafeViewportHeight,
} from "../services/mobileViewportService";

export function useMobileViewport() {

  useEffect(() => {

    applySafeViewportHeight();

    window.addEventListener(
      "resize",
      applySafeViewportHeight
    );

    return () => {

      window.removeEventListener(
        "resize",
        applySafeViewportHeight
      );

    };

  }, []);

}