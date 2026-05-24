import {
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";


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

        token:
          localStorage.getItem(
            "admin_access_token"
          ),

      });

    registerSocketListener(

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

    registerSocketListener(

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