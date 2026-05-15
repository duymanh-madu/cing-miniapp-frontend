import socket from "./socketClient";

import {
  registerSocketEvents,
} from "./socketEvents";

/**
 * =====================================================
 * INITIALIZE SOCKET
 * =====================================================
 */

export function initializeSocket() {

  registerSocketEvents();

  if (
    !socket.connected
  ) {

    socket.connect();

  }

  return socket;

}

/**
 * =====================================================
 * EXPORTS
 * =====================================================
 */

export default socket;