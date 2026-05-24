import {
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";


import useFranchiseStore from "./franchiseStore";

class FranchiseRealtimeSocket {

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

      "admin:franchise:metrics",

      (
        payload
      ) => {

        useFranchiseStore
          .getState()
          .setBranchRealtimeMetrics(
            payload
          );

      }

    );

    this.initialized =
      true;

  }

}

const franchiseRealtimeSocket =
  new FranchiseRealtimeSocket();

export default
  franchiseRealtimeSocket;