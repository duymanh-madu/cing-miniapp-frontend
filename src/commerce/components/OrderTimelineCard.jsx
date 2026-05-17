import {
  memo,
} from "react";

import {
  useCommerceUXStore,
} from "../stores/commerceUXStore";

function OrderTimelineCard() {

  const timeline =
    useCommerceUXStore(
      (state) =>
        state.orderTimeline
    );

  return (

    <div
      className="

        rounded-2xl
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

        Order Timeline

      </h3>

      <div
        className="

          space-y-3

        "
      >

        {

          timeline.map(
            (item) => (

              <div
                key={item.id}
                className="flex items-start gap-3"
              >

                <div
                  className="

                    mt-1

                    h-2
                    w-2

                    rounded-full

                    bg-green-500

                  "
                />

                <div>

                  <p
                    className="

                      text-sm
                      font-medium

                    "
                  >

                    {item.title}

                  </p>

                  <p
                    className="

                      text-xs
                      text-neutral-500

                    "
                  >

                    {item.time}

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
  OrderTimelineCard
);