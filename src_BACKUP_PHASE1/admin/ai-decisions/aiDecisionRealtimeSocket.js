import {
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";


import useAiDecisionStore from "./aiDecisionStore";

class AiDecisionRealtimeSocket {

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

      "admin:ai:anomaly",

      (
        payload
      ) => {

        useAiDecisionStore
          .getState()
          .appendAnomalyDetection(
            payload
          );

      }

    );

    this.initialized =
      true;

  }

}

const aiDecisionRealtimeSocket =
  new AiDecisionRealtimeSocket();

export default
  aiDecisionRealtimeSocket;