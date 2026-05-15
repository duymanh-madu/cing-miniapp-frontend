import adminRealtimeClient from "@/admin/realtime/adminRealtimeClient";

import usePageBuilderStore from "./pageBuilderStore";

class PageBuilderRealtimeSocket {

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

      "admin:builder:update",

      (
        payload
      ) => {

        usePageBuilderStore
          .getState()
          .setRuntimePreview(
            payload
          );

      }

    );

    this.initialized =
      true;

  }

}

const pageBuilderRealtimeSocket =
  new PageBuilderRealtimeSocket();

export default
  pageBuilderRealtimeSocket;