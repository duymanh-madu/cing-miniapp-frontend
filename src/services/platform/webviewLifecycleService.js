import loggerService from "@/services/logger/loggerService";

/**
 * =========================================================
 * WEBVIEW LIFECYCLE SERVICE
 * =========================================================
 */

class WebviewLifecycleService {

  initialized = false;

  init() {

    if (
      this.initialized
    ) {

      return;

    }

    document.addEventListener(
      "visibilitychange",
      this.handleVisibility
    );

    this.initialized = true;

  }

  handleVisibility = () => {

    loggerService.info(
      "Visibility Changed",
      {
        hidden:
          document.hidden,
      }
    );

  };

}

const webviewLifecycleService =
  new WebviewLifecycleService();

export default
  webviewLifecycleService;