import {
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";


import useDevopsStore from "./devopsStore";

class DevopsRealtimeSocket {

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

      "admin:audit:log",

      (
        payload
      ) => {

        useDevopsStore
          .getState()
          .appendAuditLog(
            payload
          );

      }

    );

    this.initialized =
      true;

  }

}

const devopsRealtimeSocket =
  new DevopsRealtimeSocket();

export default
  devopsRealtimeSocket;