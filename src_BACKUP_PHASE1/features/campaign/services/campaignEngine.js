import campaignStore from "@/features/campaign/store/campaignStore";

class CampaignEngine {

  sync(campaigns) {

    campaignStore
      .getState()
      .setCampaigns(
        campaigns
      );

  }

}

const campaignEngine =
  new CampaignEngine();

export default
  campaignEngine;