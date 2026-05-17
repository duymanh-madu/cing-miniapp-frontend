import { useEffect } from "react";

import realtimeSocket from "@/realtime/socket";

import {
 connectOrderRealtime,
} from "../services/orderRealtimeBridge";

export function useOrderRealtime() {

  useEffect(() => {

    connectOrderRealtime({

      socket:
        realtimeSocket,

    });

  }, []);

}