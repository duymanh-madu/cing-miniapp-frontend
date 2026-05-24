import {
  useEffect,
} from "react";

import campaignBootstrap from "../campaignBootstrap";

import campaignRealtimeSocket from "../campaignRealtimeSocket";

import useCampaignStore from "../campaignStore";

import CampaignBuilderForm from "../components/CampaignBuilderForm";

import CampaignGrid from "../components/CampaignGrid";

function CampaignsPage() {

  const campaigns =
    useCampaignStore(
      (
        state
      ) => state.campaigns
    );

  useEffect(() => {

    campaignBootstrap
      .bootstrap();

    campaignRealtimeSocket
      .initialize();

  }, []);

  return (

    <div
      className="
        space-y-6
      "
    >

      <div
        className="
          text-3xl
          font-black
        "
      >
        Campaign Operating System
      </div>

      <CampaignBuilderForm />

      <CampaignGrid
        campaigns={
          campaigns
        }
      />

    </div>

  );

}

export default
  CampaignsPage;