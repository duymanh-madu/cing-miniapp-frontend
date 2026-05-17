import {
  memo,
} from "react";

import {
  useCampaignStore,
} from "../store/campaignStore";

function CampaignBannerCarousel() {

  const banners =
    useCampaignStore(
      (state) =>
        state.featuredBanners
    );

  return (

    <div
      className="

        flex
        gap-4

        overflow-x-auto

        pb-2

      "
    >

      {

        banners.map(
          (banner) => (

            <div
              key={banner.id}
              className="

                min-w-[280px]

                overflow-hidden

                rounded-3xl

                bg-white

                shadow-sm

              "
            >

              <img
                src={banner.image}
                alt={banner.title}
                className="

                  h-40
                  w-full

                  object-cover

                "
              />

            </div>

          )
        )

      }

    </div>

  );

}

export default memo(
  CampaignBannerCarousel
);