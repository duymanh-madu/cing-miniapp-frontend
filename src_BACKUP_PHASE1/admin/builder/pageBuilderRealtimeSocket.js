import {
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";


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

        token:
          localStorage.getItem(
            "admin_access_token"
          ),

      });

    registerSocketListener(

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