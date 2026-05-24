import {
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";


import useMessageTimelineStore from "./messageTimelineStore";

class MessageTimelineRealtimeSocket {

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

      "admin:conversation:update",

      (
        payload
      ) => {

        useMessageTimelineStore
          .getState()
          .appendConversation(
            payload
          );

      }

    );

    this.initialized =
      true;

  }

}

const messageTimelineRealtimeSocket =
  new MessageTimelineRealtimeSocket();

export default
  messageTimelineRealtimeSocket;