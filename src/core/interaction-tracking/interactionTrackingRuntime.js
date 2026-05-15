import telemetryRuntime from "@/core/telemetry/telemetryRuntime";

class InteractionTrackingRuntime {

  track({
    interaction,
    payload,
  }) {

    telemetryRuntime.track({

      type:
        "interaction",

      payload: {

        interaction,

        ...payload,

      },

    });

  }

}

const interactionTrackingRuntime =
  new InteractionTrackingRuntime();

export default
  interactionTrackingRuntime;