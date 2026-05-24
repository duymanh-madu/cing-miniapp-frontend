import {
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";


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

        token:
          localStorage.getItem(
            "admin_access_token"
          ),

      });

    registerSocketListener(

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