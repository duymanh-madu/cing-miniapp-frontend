import socketConnectionManager from "@/sockets/socketConnectionManager";

import loggerService from "@/services/logger/loggerService";

/**
 * =========================================================
 * SOCKET MONITORING SERVICE
 * =========================================================
 */

class SocketMonitoringService {
  initialized = false;

  init() {
    if (this.initialized) {
      return;
    }

    socketConnectionManager.on(
      "message",
      this.handleMessage
    );

    this.initialized = true;
  }

  handleMessage = (
    payload
  ) => {
    loggerService.debug(
      "Realtime Message",
      payload
    );
  };
}

const socketMonitoringService =
  new SocketMonitoringService();

export default socketMonitoringService;