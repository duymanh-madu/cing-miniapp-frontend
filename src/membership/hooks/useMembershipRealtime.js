import {
  useEffect,
} from "react";

import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";

import {
  connectMembershipRealtime,
} from "../services/membershipRealtimeBridge";

export function useMembershipRealtime() {

  useEffect(() => {
    const realtimeSocket =
      getRuntimeSocket();

    if (!realtimeSocket) {
      return;
    }

    connectMembershipRealtime({
      socket:
        realtimeSocket,
    });
  }, []);

}