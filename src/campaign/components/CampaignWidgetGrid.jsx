import {
  memo,
} from "react";

import {
  useCampaignStore,
} from "../store/campaignStore";

function CampaignWidgetGrid() {

  const widgets =
    useCampaignStore(
      (state) =>
        state.campaignWidgets
    );

  return (

    <div
      className="

        grid
        grid-cols-2

        gap-4

      "
    >

      {

        widgets.map(
          (widget) => (

            <div
              key={widget.id}
              className="

                rounded-3xl

                bg-white

                p-4

                shadow-sm

              "
            >

              <h3
                className="

                  text-sm
                  font-semibold

                "
              >

                {widget.title}

              </h3>

            </div>

          )
        )

      }

    </div>

  );

}

export default memo(
  CampaignWidgetGrid
);