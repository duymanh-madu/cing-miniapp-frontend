import adminRealtimeClient from "@/admin/realtime/adminRealtimeClient";

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
      adminRealtimeClient.connect({

        token:
          localStorage.getItem(
            "admin_access_token"
          ),

      });

    socket.on(

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