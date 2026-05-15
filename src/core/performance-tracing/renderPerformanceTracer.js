import telemetryRuntime from "@/core/telemetry/telemetryRuntime";

class RenderPerformanceTracer {

  trace({
    component,
    duration,
  }) {

    telemetryRuntime.track({

      type:
        "render.performance",

      payload: {

        component,

        duration,

      },

    });

  }

}

const renderPerformanceTracer =
  new RenderPerformanceTracer();

export default
  renderPerformanceTracer;