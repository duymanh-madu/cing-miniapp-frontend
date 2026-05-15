import useRuntimeMetricsStore from "@/core/runtime-metrics/runtimeMetricsStore";

class WebsocketLatencyTracker {

  track({
    latency,
  }) {

    useRuntimeMetricsStore
      .getState()
      .setWebsocketLatency(
        latency
      );

  }

}

const websocketLatencyTracker =
  new WebsocketLatencyTracker();

export default
  websocketLatencyTracker;