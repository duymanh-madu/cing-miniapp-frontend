import adminRealtimeClient from "@/admin/realtime/adminRealtimeClient";

import useIntegrationStore from "./integrationStore";

class IntegrationRealtimeSocket {

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

      "admin:webhook:delivery",

      (
        payload
      ) => {

        useIntegrationStore
          .getState()
          .appendWebhookDelivery(
            payload
          );

      }

    );

    this.initialized =
      true;

  }

}

const integrationRealtimeSocket =
  new IntegrationRealtimeSocket();

export default
  integrationRealtimeSocket;