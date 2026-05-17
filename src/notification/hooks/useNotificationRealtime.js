import { useEffect }
  from "react";

import realtimeSocket from "@/realtime/socket";

import {
  connectNotificationRealtime,
} from "../services/notificationRealtimeBridge";

export function useNotificationRealtime() {

  useEffect(() => {

    connectNotificationRealtime({

      socket:
        realtimeSocket,

    });

  }, []);

}