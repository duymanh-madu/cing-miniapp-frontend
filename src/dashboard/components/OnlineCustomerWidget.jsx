import { memo } from "react";

import {
  useDashboardRealtimeStore,
} from "../stores/dashboardRealtimeStore";

function OnlineCustomerWidget() {

  const online =
    useDashboardRealtimeStore(
      (state) =>
        state.onlineCustomers
    );

  return (

    <div className="rounded-2xl bg-white p-4 shadow-sm">

      <p className="text-sm text-neutral-500">

        Online Customers

      </p>

      <h2 className="mt-2 text-3xl font-bold">

        {online}

      </h2>

    </div>

  );

}

export default memo(
  OnlineCustomerWidget
);