import adminRealtimeClient from "@/admin/realtime/adminRealtimeClient";

import useBranchRuntimeStore from "./branchRuntimeStore";

class BranchRuntimeRealtimeSocket {

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

      "admin:branch:alert",

      (
        payload
      ) => {

        useBranchRuntimeStore
          .getState()
          .appendBranchAlert(
            payload
          );

      }

    );

    this.initialized =
      true;

  }

}

const branchRuntimeRealtimeSocket =
  new BranchRuntimeRealtimeSocket();

export default
  branchRuntimeRealtimeSocket;