import runtimeTraceBridge from "@/core/tracing/runtimeTraceBridge";

import runtimeFrameMonitor from "@/core/performance-tracing/runtimeFrameMonitor";

import runtimeMemoryMonitor from "@/core/runtime-metrics/runtimeMemoryMonitor";

import runtimeAnalyticsBridge from "@/core/frontend-analytics/runtimeAnalyticsBridge";

class RuntimeTelemetryBootstrap {

  initialized =
    false;

  initialize() {

    if (
      this.initialized
    ) {

      return;

    }

    runtimeTraceBridge
      .initialize();

    runtimeFrameMonitor
      .initialize();

    runtimeMemoryMonitor
      .initialize();

    runtimeAnalyticsBridge
      .initialize();

    this.initialized =
      true;

  }

}

const runtimeTelemetryBootstrap =
  new RuntimeTelemetryBootstrap();

export default
  runtimeTelemetryBootstrap;