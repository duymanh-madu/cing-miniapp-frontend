import {
  memo,
} from "react";

import {
  useCampaignStore,
} from "../store/campaignStore";

function LiveCampaignStrip() {

  const campaigns =
    useCampaignStore(
      (state) =>
        state.activeCampaigns
    );

  return (

    <div
      className="

        flex
        gap-3

        overflow-x-auto

        pb-2

      "
    >

      {

        campaigns.map(
          (campaign) => (

            <div
              key={campaign.id}
              className="

                min-w-[220px]

                rounded-3xl

                bg-black
                text-white

                p-4

              "
            >

              <h3
                className="

                  text-sm
                  font-semibold

                "
              >

                {campaign.title}

              </h3>

            </div>

          )
        )

      }

    </div>

  );

}

export default memo(
  LiveCampaignStrip
);