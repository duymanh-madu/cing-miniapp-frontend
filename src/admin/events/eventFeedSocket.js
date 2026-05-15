import adminRealtimeClient from "../realtime/adminRealtimeClient";

import useEventFeedStore from "./eventFeedStore";

class EventFeedSocket {

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

      "admin:event",

      (
        payload
      ) => {

        useEventFeedStore
          .getState()
          .append(
            payload
          );

      }

    );

    this.initialized =
      true;

  }

}

const eventFeedSocket =
  new EventFeedSocket();

export default
  eventFeedSocket;