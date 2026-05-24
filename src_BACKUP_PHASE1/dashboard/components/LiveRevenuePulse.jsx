import { memo } from "react";

import {
  useDashboardRealtimeStore,
} from "../stores/dashboardRealtimeStore";

function LiveRevenuePulse() {

  const revenue =
    useDashboardRealtimeStore(
      (state) =>
        state.liveRevenue
    );

  return (

    <div className="rounded-2xl bg-white p-4 shadow-sm">

      <p className="text-sm text-neutral-500">
        Live Revenue
      </p>

      <h2 className="mt-2 text-3xl font-bold">

        {revenue.toLocaleString()}đ

      </h2>

    </div>

  );

}

export default memo(
  LiveRevenuePulse
);