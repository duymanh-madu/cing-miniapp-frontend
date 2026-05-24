import { memo } from "react";

import {
  useOperationsStore,
} from "../stores/operationsStore";

function OperationsLiveOrders() {

  const orders =
    useOperationsStore(
      (state) =>
        state.liveOrders
    );

  return (

    <div className="rounded-2xl bg-white p-4 shadow-sm">

      <h3 className="mb-4 font-semibold">

        Incoming Orders

      </h3>

      <div className="space-y-2">

        {orders.map((order) => (

          <div
            key={order.id}
            className="flex items-center justify-between"
          >

            <span>
              #{order.code}
            </span>

            <span>
              {order.total}đ
            </span>

          </div>

        ))}

      </div>

    </div>

  );

}

export default memo(
  OperationsLiveOrders
);