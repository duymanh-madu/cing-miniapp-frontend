import {
  useEffect,
} from "react";

import realtimeSocket from "@/realtime/socket";

import {
  trackEvent,
} from "../services/analyticsTracker";

export function useRealtimePerformanceAnalytics() {

  useEffect(() => {

    realtimeSocket.on(
      "connect",
      () => {

        trackEvent({

          type:
            "socket_connected",

        });

      }
    );

    realtimeSocket.on(
      "disconnect",
      () => {

        trackEvent({

          type:
            "socket_disconnected",

        });

      }
    );

  }, []);

}