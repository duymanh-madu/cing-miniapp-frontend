import telemetryRuntime from "@/core/telemetry/telemetryRuntime";

class RuntimeObservabilityEngine {

  observe({
    runtime,
    event,
    payload,
  }) {

    telemetryRuntime.track({

      type:
        "runtime.observe",

      payload: {

        runtime,

        event,

        payload,

      },

    });

  }

}

const runtimeObservabilityEngine =
  new RuntimeObservabilityEngine();

export default
  runtimeObservabilityEngine;