import adminRealtimeClient from "@/admin/realtime/adminRealtimeClient";

import useCampaignStore from "./campaignStore";

class CampaignRealtimeSocket {

  initialized =
    false;

  initialize() {

    if (
      this.initialized
    ) {

      return;

    }

    const socket =
      adminRealtimeClient.connect({

        token:
          localStorage.getItem(
            "admin_access_token"
          ),

      });

    socket.on(

      "admin:campaign:update",

      (
        payload
      ) => {

        const store =
          useCampaignStore
            .getState();

        const nextCampaigns =

          store.campaigns.map(
            (
              item
            ) =>

              item.id ===
              payload.id

                ? payload

                : item
          );

        store.setCampaigns(
          nextCampaigns
        );

      }

    );

    this.initialized =
      true;

  }

}

const campaignRealtimeSocket =
  new CampaignRealtimeSocket();

export default
  campaignRealtimeSocket;