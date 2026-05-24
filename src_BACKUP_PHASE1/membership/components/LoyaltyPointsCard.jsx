import {
  memo,
} from "react";

import {
  useMembershipStore,
} from "../store/membershipStore";

function LoyaltyPointsCard() {

  const points =
    useMembershipStore(
      (state) =>
        state.loyaltyPoints
    );

  return (

    <div
      className="

        rounded-3xl

        bg-white

        p-5

        shadow-sm

      "
    >

      <p
        className="

          text-xs
          text-neutral-500

        "
      >

        Loyalty Points

      </p>

      <h2
        className="

          mt-2

          text-3xl
          font-bold

        "
      >

        {points}

      </h2>

    </div>

  );

}

export default memo(
  LoyaltyPointsCard
);