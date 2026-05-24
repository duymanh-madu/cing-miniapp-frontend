import { useEffect }
  from "react";

import realtimeSocket from "@/realtime/socket";

import {
  connectCommerceRealtime,
} from "../services/commerceRealtimeBridge";

export function useCommerceRealtime() {

  useEffect(() => {

    connectCommerceRealtime({

      socket:
        realtimeSocket,

    });

  }, []);

}