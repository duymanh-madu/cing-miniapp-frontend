import {
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";


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

        token:
          localStorage.getItem(
            "admin_access_token"
          ),

      });

    registerSocketListener(

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