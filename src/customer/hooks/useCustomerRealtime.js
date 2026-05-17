import { useEffect } from "react";

import realtimeSocket from "@/realtime/socket";

import {
  connectCustomerRealtime,
} from "../services/customerRealtimeBridge";

export function useCustomerRealtime() {

  useEffect(() => {

    connectCustomerRealtime({

      socket:
        realtimeSocket,

    });

  }, []);

}