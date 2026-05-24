import {
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";


import useIposStore from "./iposStore";

class IposRealtimeSocket {

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

      "admin:ipos:sync",

      (
        payload
      ) => {

        useIposStore
          .getState()
          .appendRealtimeSyncEvent(
            payload
          );

      }

    );

    this.initialized =
      true;

  }

}

const iposRealtimeSocket =
  new IposRealtimeSocket();

export default
  iposRealtimeSocket;