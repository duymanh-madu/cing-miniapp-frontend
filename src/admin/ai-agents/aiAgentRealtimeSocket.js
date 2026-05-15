import adminRealtimeClient from "@/admin/realtime/adminRealtimeClient";

import useAiAgentStore from "./aiAgentStore";

class AiAgentRealtimeSocket {

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

      "admin:ai:autonomous-action",

      (
        payload
      ) => {

        useAiAgentStore
          .getState()
          .appendAutonomousAction(
            payload
          );

      }

    );

    socket.on(

      "admin:ai:recommendation",

      (
        payload
      ) => {

        useAiAgentStore
          .getState()
          .appendRealtimeRecommendation(
            payload
          );

      }

    );

    this.initialized =
      true;

  }

}

const aiAgentRealtimeSocket =
  new AiAgentRealtimeSocket();

export default
  aiAgentRealtimeSocket;