import adminRealtimeClient from "@/admin/realtime/adminRealtimeClient";

import useOperationsStore from "./operationsStore";

class OperationsRealtimeSocket {

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

      "admin:operations:event",

      (
        payload
      ) => {

        useOperationsStore
          .getState()
          .appendOperationalEvent(
            payload
          );

      }

    );

    this.initialized =
      true;

  }

}

const operationsRealtimeSocket =
  new OperationsRealtimeSocket();

export default
  operationsRealtimeSocket;