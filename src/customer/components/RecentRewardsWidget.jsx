import { memo } from "react";

import {
  useCustomerUXStore,
} from "../stores/customerUXStore";

function RecentRewardsWidget() {

  const rewards =
    useCustomerUXStore(
      (state) =>
        state.recentRewards
    );

  return (

    <div className="rounded-2xl bg-white p-4 shadow-sm">

      <h3 className="mb-3 font-semibold">

        Recent Rewards

      </h3>

      <div className="space-y-2">

        {rewards.map((reward) => (

          <div
            key={reward.id}
            className="rounded-xl bg-neutral-100 p-3 text-sm"
          >

            🎁 {reward.title}

          </div>

        ))}

      </div>

    </div>

  );

}

export default memo(
  RecentRewardsWidget
);