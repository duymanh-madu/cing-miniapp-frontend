import socketConnectionManager from "@/sockets/socketConnectionManager";

import realtimeChannelRegistry from "@/services/realtime/realtimeChannelRegistry";

/**
 * =========================================================
 * REALTIME EVENT ROUTER
 * =========================================================
 */

class RealtimeEventRouter {
  started = false;

  start() {
    if (this.started) {
      return;
    }

    socketConnectionManager.on(
      "message",
      this.handleMessage
    );

    this.started = true;
  }

  stop() {
    socketConnectionManager.off(
      "message",
      this.handleMessage
    );

    this.started = false;
  }

  handleMessage = (payload = {}) => {
    const {
      channel,
      event,
      data,
    } = payload;

    if (!channel || !event) {
      return;
    }

    const registry =
      realtimeChannelRegistry.get(
        channel
      );

    if (!registry) {
      return;
    }

    const handler =
      registry.handlers?.[event];

    if (
      typeof handler !== "function"
    ) {
      return;
    }

    handler(data);
  };
}

const realtimeEventRouter =
  new RealtimeEventRouter();

export default realtimeEventRouter;