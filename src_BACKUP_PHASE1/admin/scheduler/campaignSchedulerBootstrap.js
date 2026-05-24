import campaignSchedulerService from "./campaignSchedulerService";

import useCampaignSchedulerStore from "./campaignSchedulerStore";

class CampaignSchedulerBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    const schedules =
      await campaignSchedulerService
        .getSchedules();

    useCampaignSchedulerStore
      .getState()
      .setSchedules(
        schedules
      );

    this.initialized =
      true;

  }

}

const campaignSchedulerBootstrap =
  new CampaignSchedulerBootstrap();

export default
  campaignSchedulerBootstrap;