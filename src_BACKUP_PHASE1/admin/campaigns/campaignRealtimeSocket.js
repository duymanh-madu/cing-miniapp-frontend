import {
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";


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

        token:
          localStorage.getItem(
            "admin_access_token"
          ),

      });

    registerSocketListener(

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