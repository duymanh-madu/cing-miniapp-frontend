import {

  getRuntimeSocket,

} from "@/runtime/socket/runtimeSocketClient";

/**
 * =====================================================
 * ADMIN REALTIME SOCKET
 * =====================================================
 */

class AdminRealtimeSocket {

  socket = null;

  connect() {

    this.socket =
      getRuntimeSocket();

    return this.socket;

  }

  disconnect() {

    /**
     * =================================================
     * DO NOT DISCONNECT GLOBAL SOCKET
     * =================================================
     */

    this.socket =
      null;

  }

}

const adminRealtimeSocket =
  new AdminRealtimeSocket();

export default
  adminRealtimeSocket;
