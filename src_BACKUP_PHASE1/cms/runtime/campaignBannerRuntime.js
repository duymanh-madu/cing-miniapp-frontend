import remoteConfigRuntime from "./remoteConfigRuntime";

class CampaignBannerRuntime {

  getHomepageBanner() {

    return remoteConfigRuntime
      .get(
        "homepage_banner",
        null
      );

  }

}

const campaignBannerRuntime =
  new CampaignBannerRuntime();

export default
  campaignBannerRuntime;