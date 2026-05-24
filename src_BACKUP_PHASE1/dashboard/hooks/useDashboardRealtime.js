import { useEffect } from "react";

import realtimeSocket from "@/realtime/socket";

import {
  connectDashboardRealtime,
} from "../services/dashboardRealtimeBridge";

export function useDashboardRealtime() {

  useEffect(() => {

    connectDashboardRealtime({

      socket:
        realtimeSocket,

    });

  }, []);

}