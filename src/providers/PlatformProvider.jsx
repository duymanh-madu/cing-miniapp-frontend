import {
  useEffect,
} from "react";

import mobileViewportService from "@/services/platform/mobileViewportService";

import touchInteractionService from "@/services/platform/touchInteractionService";

import webviewLifecycleService from "@/services/platform/webviewLifecycleService";

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

    webviewLifecycleService.init();

  }, []);

  return children;

}

export default
  PlatformProvider;