import loggerService from "@/services/logger/loggerService";

/**
 * =========================================================
 * RUNTIME MONITORING SERVICE
 * =========================================================
 */

class RuntimeMonitoringService {
  initialized = false;

  init() {
    if (this.initialized) {
      return;
    }

    window.addEventListener(
      "error",
      this.handleError
    );

    window.addEventListener(
      "unhandledrejection",
      this.handlePromiseRejection
    );

    this.initialized = true;
  }

  handleError = (event) => {
    loggerService.error(
      "Runtime Error",
      {
        message:
          event.message,

        filename:
          event.filename,

        lineno:
          event.lineno,
      }
    );
  };

  handlePromiseRejection = (
    event
  ) => {
    loggerService.error(
      "Unhandled Promise Rejection",
      {
        reason:
          event.reason,
      }
    );
  };
}

const runtimeMonitoringService =
  new RuntimeMonitoringService();

export default runtimeMonitoringService;