import { memo } from "react";

import {
  useOperationsStore,
} from "../stores/operationsStore";

function DeliveryQueueWidget() {

  const queue =
    useOperationsStore(
      (state) =>
        state.deliveryQueue
    );

  return (

    <div className="rounded-2xl bg-white p-4 shadow-sm">

      <h3 className="mb-4 font-semibold">

        Delivery Queue

      </h3>

      <div className="space-y-2">

        {queue.map((item) => (

          <div
            key={item.id}
            className="flex items-center justify-between"
          >

            <span>
              #{item.code}
            </span>

            <span>
              {item.driver}
            </span>

          </div>

        ))}

      </div>

    </div>

  );

}

export default memo(
  DeliveryQueueWidget
);