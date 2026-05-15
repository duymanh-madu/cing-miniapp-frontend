import eventBus from "@/core/events/eventBus";

import frontendAnalyticsRuntime from "./frontendAnalyticsRuntime";

class RuntimeAnalyticsBridge {

  initialize() {

    eventBus.subscribe(

      "runtime.execution.completed",

      (
        payload
      ) => {

        frontendAnalyticsRuntime
          .trackAction({

            action:
              payload.runtime,

            payload,
          });

      }

    );

  }

}

const runtimeAnalyticsBridge =
  new RuntimeAnalyticsBridge();

export default
  runtimeAnalyticsBridge;