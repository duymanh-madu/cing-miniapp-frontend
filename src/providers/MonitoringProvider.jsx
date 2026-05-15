import {
  useEffect,
} from "react";

import runtimeMonitoringService from "@/services/monitoring/runtimeMonitoringService";

import performanceMonitoringService from "@/services/monitoring/performanceMonitoringService";

import socketMonitoringService from "@/services/monitoring/socketMonitoringService";

/**
 * =========================================================
 * MONITORING PROVIDER
 * =========================================================
 */

function MonitoringProvider({
  children,
}) {
  useEffect(() => {
    runtimeMonitoringService.init();

    performanceMonitoringService.init();

    socketMonitoringService.init();
  }, []);

  return children;
}

export default MonitoringProvider;