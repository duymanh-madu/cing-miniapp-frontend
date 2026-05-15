import adminRealtimeClient from "@/admin/realtime/adminRealtimeClient";

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
      adminRealtimeClient.connect({

        token:
          localStorage.getItem(
            "admin_access_token"
          ),

      });

    socket.on(

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