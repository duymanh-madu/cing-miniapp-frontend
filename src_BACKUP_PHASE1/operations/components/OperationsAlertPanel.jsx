import { memo } from "react";

import {
  useOperationsStore,
} from "../stores/operationsStore";

function OperationsAlertPanel() {

  const alerts =
    useOperationsStore(
      (state) =>
        state.alerts
    );

  return (

    <div className="rounded-2xl bg-white p-4 shadow-sm">

      <h3 className="mb-4 font-semibold">

        Live Alerts

      </h3>

      <div className="space-y-3">

        {alerts.map((alert) => (

          <div
            key={alert.id}
            className="rounded-xl bg-neutral-100 p-3 text-sm"
          >

            {alert.message}

          </div>

        ))}

      </div>

    </div>

  );

}

export default memo(
  OperationsAlertPanel
);