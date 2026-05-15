import CampaignCard from "./CampaignCard";

function CampaignGrid({
  campaigns = [],
}) {

  return (

    <div
      className="
        grid
        grid-cols-1
        gap-4
        xl:grid-cols-3
      "
    >

      {

        campaigns.map(
          (
            campaign
          ) => (

            <CampaignCard
              key={
                campaign.id
              }

              campaign={
                campaign
              }
            />

          )
        )

      }

    </div>

  );

}

export default
  CampaignGrid;