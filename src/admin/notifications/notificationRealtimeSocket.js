import adminRealtimeClient from "@/admin/realtime/adminRealtimeClient";

import useNotificationStore from "./notificationStore";

class NotificationRealtimeSocket {

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

      "admin:notification:delivery",

      (
        payload
      ) => {

        useNotificationStore
          .getState()
          .appendRealtimeDelivery(
            payload
          );

      }

    );

    socket.on(

      "admin:notification:metrics",

      (
        payload
      ) => {

        useNotificationStore
          .getState()
          .setDeliveryMetrics(
            payload
          );

      }

    );

    this.initialized =
      true;

  }

}

const notificationRealtimeSocket =
  new NotificationRealtimeSocket();

export default
  notificationRealtimeSocket;