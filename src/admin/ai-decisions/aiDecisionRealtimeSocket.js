import adminRealtimeClient from "@/admin/realtime/adminRealtimeClient";

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
      adminRealtimeClient.connect({

        token:
          localStorage.getItem(
            "admin_access_token"
          ),

      });

    socket.on(

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