import {
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";


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

        token:
          localStorage.getItem(
            "admin_access_token"
          ),

      });

    registerSocketListener(

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