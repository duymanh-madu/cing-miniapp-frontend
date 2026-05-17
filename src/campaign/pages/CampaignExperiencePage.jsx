import {
  useCampaignRealtime,
} from "../hooks/useCampaignRealtime";

import CampaignBannerCarousel from "../components/CampaignBannerCarousel";

import CampaignWidgetGrid from "../components/CampaignWidgetGrid";

import LiveCampaignStrip from "../components/LiveCampaignStrip";

function CampaignExperiencePage() {

  useCampaignRealtime();

  return (

    <div
      className="

        space-y-5

        p-4

      "
    >

      <CampaignBannerCarousel />

      <LiveCampaignStrip />

      <CampaignWidgetGrid />

    </div>

  );

}

export default CampaignExperiencePage;