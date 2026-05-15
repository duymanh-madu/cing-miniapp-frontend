import adminRealtimeClient from "@/admin/realtime/adminRealtimeClient";

import useObservabilityStore from "./observabilityStore";

class ObservabilityRealtimeSocket {

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

      "admin:logs:stream",

      (
        payload
      ) => {

        useObservabilityStore
          .getState()
          .appendRealtimeLog(
            payload
          );

      }

    );

    socket.on(

      "admin:health:update",

      (
        payload
      ) => {

        useObservabilityStore
          .getState()
          .setSystemHealth(
            payload
          );

      }

    );

    socket.on(

      "admin:incident:new",

      (
        payload
      ) => {

        const store =
          useObservabilityStore
            .getState();

        store.setActiveIncidents([

          payload,

          ...store.activeIncidents,

        ]);

      }

    );

    this.initialized =
      true;

  }

}

const observabilityRealtimeSocket =
  new ObservabilityRealtimeSocket();

export default
  observabilityRealtimeSocket;