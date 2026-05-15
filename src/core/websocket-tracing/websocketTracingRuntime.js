import telemetryRuntime from "@/core/telemetry/telemetryRuntime";

class WebsocketTracingRuntime {

  trace({
    event,
    payload,
  }) {

    telemetryRuntime.track({

      type:
        "websocket.event",

      payload: {

        event,

        payload,

      },

    });

  }

}

const websocketTracingRuntime =
  new WebsocketTracingRuntime();

export default
  websocketTracingRuntime;