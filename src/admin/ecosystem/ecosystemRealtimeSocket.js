import adminRealtimeClient from "@/admin/realtime/adminRealtimeClient";

import useEcosystemStore from "./ecosystemStore";

class EcosystemRealtimeSocket {

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

      "admin:ecosystem:update",

      (
        payload
      ) => {

        useEcosystemStore
          .getState()
          .setFederationRuntime(
            payload
          );

      }

    );

    this.initialized =
      true;

  }

}

const ecosystemRealtimeSocket =
  new EcosystemRealtimeSocket();

export default
  ecosystemRealtimeSocket;