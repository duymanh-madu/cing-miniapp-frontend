import useRuntimeTimelineStore from "@/core/runtime-timeline/runtimeTimelineStore";

import eventBus from "@/core/events/eventBus";

class RuntimeEventReplayBridge {

  initialize() {

    const events = [

      "runtime.execution.started",

      "runtime.execution.completed",

      "runtime.execution.failed",

      "runtime.lifecycle.ready",

      "runtime.health.updated",

    ];

    events.forEach(
      (
        eventName
      ) => {

        eventBus.subscribe(

          eventName,

          (
            payload
          ) => {

            useRuntimeTimelineStore
              .getState()
              .appendTimelineEvent({

                event:
                  eventName,

                payload,

                timestamp:
                  Date.now(),

              });

          }

        );

      }
    );

  }

}

const runtimeEventReplayBridge =
  new RuntimeEventReplayBridge();

export default
  runtimeEventReplayBridge;