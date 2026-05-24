import { memo } from "react";

import {
  useDashboardRealtimeStore,
} from "../stores/dashboardRealtimeStore";

function RealtimeOrderTracker() {

  const orders =
    useDashboardRealtimeStore(
      (state) =>
        state.activeOrders
    );

  return (

    <div className="rounded-2xl bg-white p-4 shadow-sm">

      <h3 className="mb-4 font-semibold">

        Live Orders

      </h3>

      <div className="space-y-3">

        {orders.map((order) => (

          <div
            key={order.id}
            className="flex items-center justify-between"
          >

            <span>
              #{order.code}
            </span>

            <span>
              {order.status}
            </span>

          </div>

        ))}

      </div>

    </div>

  );

}

export default memo(
  RealtimeOrderTracker
);