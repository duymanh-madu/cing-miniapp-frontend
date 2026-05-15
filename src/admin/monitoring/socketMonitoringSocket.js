import adminRealtimeClient from "../realtime/adminRealtimeClient";

import useSocketMonitoringStore from "./socketMonitoringStore";

class SocketMonitoringSocket {

  initialized =
    false;

  initialize() {

    if (
      this.initialized
    ) {

      return;

    }

    const socket =
      adminRealtimeClient.connect({

        token:
          localStorage.getItem(
            "admin_access_token"
          ),

      });

    socket.on(

      "admin:socket:monitor",

      (
        payload
      ) => {

        useSocketMonitoringStore
          .getState()
          .setSnapshot(
            payload
          );

      }

    );

    this.initialized =
      true;

  }

}

const socketMonitoringSocket =
  new SocketMonitoringSocket();

export default
  socketMonitoringSocket;