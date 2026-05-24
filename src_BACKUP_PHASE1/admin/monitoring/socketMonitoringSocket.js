import {
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";


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

        token:
          localStorage.getItem(
            "admin_access_token"
          ),

      });

    registerSocketListener(

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