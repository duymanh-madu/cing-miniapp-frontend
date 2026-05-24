import eventBus from "@/core/events/eventBus";

import runtimeActionEngine from "./runtimeActionEngine";

class RuntimeEventActionBridge {

  initialize({
    event,
    actions,
  }) {

    eventBus.subscribe(

      event,

      async (
        payload
      ) => {

        await runtimeActionEngine
          .executeActions({

            actions,

            payload,

          });

      }

    );

  }

}

const runtimeEventActionBridge =
  new RuntimeEventActionBridge();

export default
  runtimeEventActionBridge;