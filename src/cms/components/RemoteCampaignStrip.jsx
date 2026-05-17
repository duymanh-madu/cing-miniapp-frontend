import {
  memo,
} from "react";

function RemoteCampaignStrip({

  campaigns = [],

}) {

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

                rounded-2xl

                bg-black
                text-white

                p-4

              "
            >

              <h4
                className="

                  text-sm
                  font-semibold

                "
              >

                {campaign.title}

              </h4>

              <p
                className="

                  mt-2

                  text-xs
                  text-white/70

                "
              >

                {campaign.description}

              </p>

            </div>

          )
        )

      }

    </div>

  );

}

export default memo(
  RemoteCampaignStrip
);