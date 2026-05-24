import {
  memo,
} from "react";

import {
  useMembershipStore,
} from "../store/membershipStore";

function LoyaltyHistoryList() {

  const history =
    useMembershipStore(
      (state) =>
        state.loyaltyHistory
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

        Loyalty History

      </h3>

      <div
        className="space-y-3"
      >

        {

          history.map(
            (item) => (

              <div
                key={item.id}
                className="

                  flex
                  items-center
                  justify-between

                  text-sm

                "
              >

                <span>

                  {item.title}

                </span>

                <span
                  className="font-medium"
                >

                  +{item.points}

                </span>

              </div>

            )
          )

        }

      </div>

    </div>

  );

}

export default memo(
  LoyaltyHistoryList
);