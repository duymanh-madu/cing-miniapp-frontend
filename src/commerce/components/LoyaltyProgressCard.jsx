import {
  memo,
} from "react";

import {
  useCommerceUXStore,
} from "../stores/commerceUXStore";

function LoyaltyProgressCard() {

  const progress =
    useCommerceUXStore(
      (state) =>
        state.loyaltyProgress
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

      <div
        className="

          flex
          items-center
          justify-between

        "
      >

        <h3
          className="

            text-sm
            font-semibold

          "
        >

          Loyalty Progress

        </h3>

        <span
          className="

            text-xs
            text-neutral-500

          "
        >

          {progress}%
        </span>

      </div>

      <div
        className="

          mt-4

          h-2

          overflow-hidden

          rounded-full

          bg-neutral-100

        "
      >

        <div
          className="

            h-full

            rounded-full

            bg-black

            transition-all

          "
          style={{
            width:
              `${progress}%`,
          }}
        />

      </div>

    </div>

  );

}

export default memo(
  LoyaltyProgressCard
);