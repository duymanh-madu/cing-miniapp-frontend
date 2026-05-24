import {
  memo,
} from "react";

import {
  useOrderExperienceStore,
} from "../stores/orderExperienceStore";

function ActiveOrderCard() {

  const order =
    useOrderExperienceStore(
      (state) =>
        state.activeOrder
    );

  if (!order) {

    return null;

  }

  return (

    <div
      className="

        rounded-2xl
        bg-white

        p-4

        shadow-sm

      "
    >

      <div
        className="

          flex
          items-center
          justify-between

        "
      >

        <div>

          <p
            className="

              text-xs
              text-neutral-500

            "
          >

            Active Order

          </p>

          <h3
            className="

              mt-1

              text-lg
              font-bold

            "
          >

            #{order.code}

          </h3>

        </div>

        <div
          className="

            rounded-full

            bg-black

            px-3
            py-1

            text-xs
            text-white

          "
        >

          {order.status}

        </div>

      </div>

    </div>

  );

}

export default memo(
  ActiveOrderCard
);