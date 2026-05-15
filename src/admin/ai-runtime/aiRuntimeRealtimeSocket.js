import adminRealtimeClient from "@/admin/realtime/adminRealtimeClient";

import useAiRuntimeStore from "./aiRuntimeStore";

class AiRuntimeRealtimeSocket {

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

      "admin:ai:inference",

      (
        payload
      ) => {

        useAiRuntimeStore
          .getState()
          .appendInferenceEvent(
            payload
          );

      }

    );

    this.initialized =
      true;

  }

}

const aiRuntimeRealtimeSocket =
  new AiRuntimeRealtimeSocket();

export default
  aiRuntimeRealtimeSocket;