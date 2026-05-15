import eventBus from "@/core/events/eventBus";

import runtimeEvents from "@/core/events/runtimeEvents";

class RuntimeEngineRealtimeBridge {

  bridgeSocketEvent({
    socket,
    socketEvent,
    runtimeEvent,
  }) {

    socket.on(
      socketEvent,
      (
        payload
      ) => {

        eventBus.publish(
          runtimeEvent,
          payload
        );

      }
    );

  }

  initialize({
    socket,
  }) {

    this.bridgeSocketEvent({

      socket,

      socketEvent:
        "order:created",

      runtimeEvent:
        runtimeEvents
          .ORDER_CREATED,

    });

    this.bridgeSocketEvent({

      socket,

      socketEvent:
        "campaign:updated",

      runtimeEvent:
        runtimeEvents
          .CAMPAIGN_UPDATED,

    });

    this.bridgeSocketEvent({

      socket,

      socketEvent:
        "loyalty:updated",

      runtimeEvent:
        runtimeEvents
          .LOYALTY_UPDATED,

    });

  }

}

const runtimeEngineRealtimeBridge =
  new RuntimeEngineRealtimeBridge();

export default
  runtimeEngineRealtimeBridge;