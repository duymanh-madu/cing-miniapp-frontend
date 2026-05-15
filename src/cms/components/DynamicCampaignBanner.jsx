import campaignBannerRuntime from "@/cms/runtime/campaignBannerRuntime";

function DynamicCampaignBanner() {

  const banner =
    campaignBannerRuntime
      .getHomepageBanner();

  if (
    !banner
  ) {

    return null;

  }

  return (

    <div
      className="
        rounded-3xl
        bg-gradient-to-r
        from-pink-500
        to-orange-500
        p-6
        text-white
      "
    >

      <div
        className="
          text-2xl
          font-black
        "
      >
        {
          banner.title
        }
      </div>

      <div
        className="
          mt-2
          text-sm
          opacity-80
        "
      >
        {
          banner.description
        }
      </div>

    </div>

  );

}

export default
  DynamicCampaignBanner;