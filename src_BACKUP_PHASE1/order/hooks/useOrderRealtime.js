import {
  useEffect,
} from "react";

import realtimeSocket from "@/realtime/socket";

import {
  connectOrderRealtime,
} from "../services/orderRealtimeBridge";

export function useOrderRealtime() {

  useEffect(() => {

    const disconnect =
      connectOrderRealtime({

        socket:
          realtimeSocket,

      });

    return () => {

      disconnect?.();

    };

  }, []);

}
