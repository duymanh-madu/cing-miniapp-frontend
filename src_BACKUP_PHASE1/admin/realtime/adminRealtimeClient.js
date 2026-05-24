import {

  getRuntimeSocket,

} from "@/runtime/socket/runtimeSocketClient";

/**
 * =====================================================
 * ADMIN REALTIME CLIENT
 * =====================================================
 * CENTRALIZED RUNTIME SOCKET FABRIC
 * =====================================================
 */

class AdminRealtimeClient {

  connect() {

    return getRuntimeSocket();

  }

  disconnect() {

    /**
     * Runtime socket lifecycle
     * is centrally governed
     * by runtimeSocketClient.
     */

  }

}

const adminRealtimeClient =

  new AdminRealtimeClient();

export default

  adminRealtimeClient;
