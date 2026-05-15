import adminRealtimeClient from "@/admin/realtime/adminRealtimeClient";

import useAutomationStore from "./automationStore";

class AutomationRealtimeSocket {

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

      "admin:automation:execution",

      (
        payload
      ) => {

        useAutomationStore
          .getState()
          .appendExecution(
            payload
          );

      }

    );

    socket.on(

      "admin:automation:metrics",

      (
        payload
      ) => {

        useAutomationStore
          .getState()
          .setAutomationMetrics(
            payload
          );

      }

    );

    this.initialized =
      true;

  }

}

const automationRealtimeSocket =
  new AutomationRealtimeSocket();

export default
  automationRealtimeSocket;