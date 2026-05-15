import adminRealtimeClient from "./adminRealtimeClient";

import useAnalyticsStore from "../analytics/analyticsStore";

class AdminRealtimeAnalyticsSocket {

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

      "admin:metrics:update",

      (
        payload
      ) => {

        useAnalyticsStore
          .getState()
          .setMetrics(
            payload
          );

      }

    );

    socket.on(

      "admin:event",

      (
        payload
      ) => {

        useAnalyticsStore
          .getState()
          .appendFeed(
            payload
          );

      }

    );

    this.initialized =
      true;

  }

}

const adminRealtimeAnalyticsSocket =
  new AdminRealtimeAnalyticsSocket();

export default
  adminRealtimeAnalyticsSocket;