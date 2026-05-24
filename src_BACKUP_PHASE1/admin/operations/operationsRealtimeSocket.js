import {
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";


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

        token:
          localStorage.getItem(
            "admin_access_token"
          ),

      });

    registerSocketListener(

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