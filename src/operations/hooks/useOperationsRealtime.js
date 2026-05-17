import { useEffect } from "react";

import realtimeSocket from "@/realtime/socket";

import {
  connectOperationsRealtime,
} from "../services/operationsRealtimeBridge";

export function useOperationsRealtime() {

  useEffect(() => {

    connectOperationsRealtime({

      socket:
        realtimeSocket,

    });

  }, []);

}