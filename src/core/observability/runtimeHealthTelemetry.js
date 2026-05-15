import telemetryRuntime from "@/core/telemetry/telemetryRuntime";

class RuntimeHealthTelemetry {

  track({
    runtime,
    health,
  }) {

    telemetryRuntime.track({

      type:
        "runtime.health",

      payload: {

        runtime,

        health,

      },

    });

  }

}

const runtimeHealthTelemetry =
  new RuntimeHealthTelemetry();

export default
  runtimeHealthTelemetry;