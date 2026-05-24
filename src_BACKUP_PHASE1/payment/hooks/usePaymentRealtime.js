import {
  useEffect,
} from "react";

import realtimeSocket from "@/realtime/socket";

import {
  connectPaymentRealtime,
} from "../services/paymentRealtimeBridge";

export function usePaymentRealtime() {

  useEffect(() => {

    const disconnect =
      connectPaymentRealtime({
        socket:
          realtimeSocket,
      });

    return () => {

      disconnect?.();

    };

  }, []);

}
