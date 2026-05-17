import {
  memo,
} from "react";

import {
  useAdminStore,
} from "../store/adminStore";

function AdminRealtimeAlertPanel() {

  const alerts =
    useAdminStore(
      (state) =>
        state.realtimeAlerts
    );

  return (

    <div
      className="

        rounded-3xl

        bg-white

        p-4

        shadow-sm

      "
    >

      <h3
        className="

          mb-4

          text-sm
          font-semibold

        "
      >

        Live Alerts

      </h3>

      <div
        className="space-y-3"
      >

        {

          alerts.map(
            (alert) => (

              <div
                key={alert.id}
                className="

                  rounded-2xl

                  bg-neutral-100

                  p-3

                  text-sm

                "
              >

                {alert.message}

              </div>

            )
          )

        }

      </div>

    </div>

  );

}

export default memo(
  AdminRealtimeAlertPanel
);