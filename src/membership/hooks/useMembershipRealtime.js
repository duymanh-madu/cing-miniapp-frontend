import {
  useEffect,
} from "react";

import realtimeSocket from "@/realtime/socket";

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