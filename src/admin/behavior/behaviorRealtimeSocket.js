import adminRealtimeClient from "@/admin/realtime/adminRealtimeClient";

import useBehaviorStore from "./behaviorStore";

class BehaviorRealtimeSocket {

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

      "admin:customer:activity",

      (
        payload
      ) => {

        useBehaviorStore
          .getState()
          .appendActivity(
            payload
          );

      }

    );

    this.initialized =
      true;

  }

}

const behaviorRealtimeSocket =
  new BehaviorRealtimeSocket();

export default
  behaviorRealtimeSocket;