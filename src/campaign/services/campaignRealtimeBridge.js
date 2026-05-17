import {
  useCampaignStore,
} from "../store/campaignStore";

export function connectCampaignRealtime({
  socket,
}) {

  socket.on(
    "campaign.updated",
    (payload) => {

      useCampaignStore
        .getState()
        .setActiveCampaigns(
          payload
        );

    }
  );

  socket.on(
    "campaign.banners",
    (payload) => {

      useCampaignStore
        .getState()
        .setFeaturedBanners(
          payload
        );

    }
  );

}