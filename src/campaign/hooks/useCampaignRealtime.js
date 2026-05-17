import {
  useEffect,
} from "react";

import realtimeSocket from "@/realtime/socket";

import {
  connectCampaignRealtime,
} from "../services/campaignRealtimeBridge";

export function useCampaignRealtime() {

  useEffect(() => {

    connectCampaignRealtime({

      socket:
        realtimeSocket,

    });

  }, []);

}