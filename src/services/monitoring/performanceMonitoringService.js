import loggerService from "@/services/logger/loggerService";

/**
 * =========================================================
 * PERFORMANCE MONITORING SERVICE
 * =========================================================
 */

class PerformanceMonitoringService {
  initialized = false;

  init() {
    if (
      this.initialized ||
      !window.performance
    ) {
      return;
    }

    window.addEventListener(
      "load",
      () => {
        const navigation =
          performance.getEntriesByType(
            "navigation"
          )?.[0];

        loggerService.info(
          "Performance Metrics",
          {
            domComplete:
              navigation?.domComplete,

            loadEventEnd:
              navigation?.loadEventEnd,
          }
        );
      }
    );

    this.initialized = true;
  }
}

const performanceMonitoringService =
  new PerformanceMonitoringService();

export default
  performanceMonitoringService;