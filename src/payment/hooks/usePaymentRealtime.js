import {
  useEffect,
} from "react";

import realtimeSocket from "@/realtime/socket";

import {
  connectPaymentRealtime,
} from "../services/paymentRealtimeBridge";

export function usePaymentRealtime() {

  useEffect(() => {

    connectPaymentRealtime({

      socket:
        realtimeSocket,

    });

  }, []);

}