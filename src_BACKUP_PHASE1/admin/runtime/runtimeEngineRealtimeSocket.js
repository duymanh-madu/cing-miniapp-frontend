import {
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";


import useRuntimeEngineStore from "./runtimeEngineStore";

class RuntimeEngineRealtimeSocket {

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

      "admin:runtime:event",

      (
        payload
      ) => {

        useRuntimeEngineStore
          .getState()
          .appendRuntimeEvent(
            payload
          );

      }

    );

    this.initialized =
      true;

  }

}

const runtimeEngineRealtimeSocket =
  new RuntimeEngineRealtimeSocket();

export default
  runtimeEngineRealtimeSocket;