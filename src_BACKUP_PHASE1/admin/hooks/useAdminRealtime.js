import {
  useEffect,
} from "react";

import realtimeSocket from "@/realtime/socket";

import {
  connectAdminRealtime,
} from "../services/adminRealtimeBridge";

export function useAdminRealtime() {

  useEffect(() => {

    connectAdminRealtime({

      socket:
        realtimeSocket,

    });

  }, []);

}