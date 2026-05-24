import eventBus from "@/core/events/eventBus";

import distributedTracingRuntime from "./distributedTracingRuntime";

class RuntimeTraceBridge {

  initialize() {

    eventBus.subscribe(

      "runtime.execution.started",

      (
        payload
      ) => {

        distributedTracingRuntime
          .startTrace({

            traceId:
              payload.runtime,

            name:
              payload.runtime,

          });

      }

    );

    eventBus.subscribe(

      "runtime.execution.completed",

      (
        payload
      ) => {

        distributedTracingRuntime
          .completeTrace(
            payload.runtime
          );

      }

    );

  }

}

const runtimeTraceBridge =
  new RuntimeTraceBridge();

export default
  runtimeTraceBridge;