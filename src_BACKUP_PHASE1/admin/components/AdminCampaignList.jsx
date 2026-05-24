import {
  memo,
} from "react";

import {
  useAdminStore,
} from "../store/adminStore";

function AdminCampaignList() {

  const campaigns =
    useAdminStore(
      (state) =>
        state.campaigns
    );

  return (

    <div
      className="

        rounded-3xl

        bg-white

        p-4

        shadow-sm

      "
    >

      <h3
        className="

          mb-4

          text-sm
          font-semibold

        "
      >

        Campaigns

      </h3>

      <div
        className="space-y-3"
      >

        {

          campaigns.map(
            (campaign) => (

              <div
                key={campaign.id}
                className="

                  flex
                  items-center
                  justify-between

                  rounded-2xl

                  border
                  border-neutral-100

                  p-3

                "
              >

                <div>

                  <p
                    className="

                      text-sm
                      font-medium

                    "
                  >

                    {campaign.title}

                  </p>

                  <p
                    className="

                      mt-1

                      text-xs
                      text-neutral-500

                    "
                  >

                    {campaign.status}

                  </p>

                </div>

              </div>

            )
          )

        }

      </div>

    </div>

  );

}

export default memo(
  AdminCampaignList
);