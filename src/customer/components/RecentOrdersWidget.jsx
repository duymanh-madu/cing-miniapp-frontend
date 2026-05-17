import { memo } from "react";

import {
  useCustomerUXStore,
} from "../stores/customerUXStore";

function RecentOrdersWidget() {

  const orders =
    useCustomerUXStore(
      (state) =>
        state.recentOrders
    );

  return (

    <div className="rounded-2xl bg-white p-4 shadow-sm">

      <h3 className="mb-3 font-semibold">

        Recent Orders

      </h3>

      <div className="space-y-2">

        {orders.map((order) => (

          <div
            key={order.id}
            className="flex items-center justify-between rounded-xl bg-neutral-100 p-3 text-sm"
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
  RecentOrdersWidget
);