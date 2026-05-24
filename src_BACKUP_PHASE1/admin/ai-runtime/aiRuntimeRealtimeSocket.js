import {
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";


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

        token:
          localStorage.getItem(
            "admin_access_token"
          ),

      });

    registerSocketListener(

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