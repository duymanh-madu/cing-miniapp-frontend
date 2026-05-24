import {
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";


import useAlertStore from "./alertStore";

class AlertRealtimeSocket {

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

      "admin:alert:new",

      (
        payload
      ) => {

        useAlertStore
          .getState()
          .appendAlert(
            payload
          );

      }

    );

    this.initialized =
      true;

  }

}

const alertRealtimeSocket =
  new AlertRealtimeSocket();

export default
  alertRealtimeSocket;