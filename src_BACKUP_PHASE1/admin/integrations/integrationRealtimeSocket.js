import {
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";


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

        token:
          localStorage.getItem(
            "admin_access_token"
          ),

      });

    registerSocketListener(

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