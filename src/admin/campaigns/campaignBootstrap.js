import campaignService from "./campaignService";

import useCampaignStore from "./campaignStore";

class CampaignBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    const store =
      useCampaignStore
        .getState();

    try {

      store.setLoading(
        true
      );

      const campaigns =
        await campaignService
          .getCampaigns();

      store.setCampaigns(
        campaigns
      );

    } finally {

      store.setLoading(
        false
      );

      this.initialized =
        true;

    }

  }

}

const campaignBootstrap =
  new CampaignBootstrap();

export default
  campaignBootstrap;