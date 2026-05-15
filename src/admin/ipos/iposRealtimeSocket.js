import adminRealtimeClient from "@/admin/realtime/adminRealtimeClient";

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
      adminRealtimeClient.connect({

        token:
          localStorage.getItem(
            "admin_access_token"
          ),

      });

    socket.on(

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