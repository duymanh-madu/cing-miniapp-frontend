import {
  useEffect,
} from "react";

import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";

import {
  connectMembershipRealtime,
} from "../services/membershipRealtimeBridge";

export function useMembershipRealtime() {

  useEffect(() => {

    connectMembershipRealtime({

      socket:
        realtimeSocket,

    });

  }, []);

}