import { memo } from "react";

import {
  useDashboardRealtimeStore,
} from "../stores/dashboardRealtimeStore";

function RealtimeActivityFeed() {

  const feed =
    useDashboardRealtimeStore(
      (state) =>
        state.activityFeed
    );

  return (

    <div className="rounded-2xl bg-white p-4 shadow-sm">

      <h3 className="mb-4 font-semibold">

        Live Activities

      </h3>

      <div className="space-y-3">

        {feed.map((item) => (

          <div
            key={item.id}
            className="text-sm"
          >

            {item.message}

          </div>

        ))}

      </div>

    </div>

  );

}

export default memo(
  RealtimeActivityFeed
);