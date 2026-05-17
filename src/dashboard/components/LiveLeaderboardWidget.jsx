import { memo } from "react";

import {
  useDashboardRealtimeStore,
} from "../stores/dashboardRealtimeStore";

function LiveLeaderboardWidget() {

  const leaderboard =
    useDashboardRealtimeStore(
      (state) =>
        state.leaderboard
    );

  return (

    <div className="rounded-2xl bg-white p-4 shadow-sm">

      <h3 className="mb-4 font-semibold">

        Top Players

      </h3>

      <div className="space-y-3">

        {leaderboard.map((user) => (

          <div
            key={user.id}
            className="flex items-center justify-between"
          >

            <span>
              {user.name}
            </span>

            <span>
              {user.score}
            </span>

          </div>

        ))}

      </div>

    </div>

  );

}

export default memo(
  LiveLeaderboardWidget
);