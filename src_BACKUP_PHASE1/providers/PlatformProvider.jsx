import {
  useEffect,
} from "react";

import mobileViewportService from "@/services/platform/mobileViewportService";

import touchInteractionService from "@/services/platform/touchInteractionService";

/**
 * =========================================================
 * PLATFORM PROVIDER
 * =========================================================
 */

function PlatformProvider({
  children,
}) {

  useEffect(() => {

    mobileViewportService.init();

    touchInteractionService.init();

  }, []);

  return children;

}

export default
  PlatformProvider;
