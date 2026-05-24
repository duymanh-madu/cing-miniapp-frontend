import {
  memo,
} from "react";

import {
  useMembershipStore,
} from "../store/membershipStore";

function MembershipTierCard() {

  const tier =
    useMembershipStore(
      (state) =>
        state.membershipTier
    );

  return (

    <div
      className="

        rounded-3xl

        bg-black
        text-white

        p-5

      "
    >

      <p
        className="

          text-xs
          text-white/70

        "
      >

        Membership Tier

      </p>

      <h2
        className="

          mt-2

          text-2xl
          font-bold

        "
      >

        {tier}

      </h2>

    </div>

  );

}

export default memo(
  MembershipTierCard
);