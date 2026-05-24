import {
  memo,
} from "react";

import {
  useAdminStore,
} from "../store/adminStore";

function AdminActivityFeed() {

  const logs =
    useAdminStore(
      (state) =>
        state.activityLogs
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

        Activity Feed

      </h3>

      <div
        className="space-y-3"
      >

        {

          logs.map(
            (log) => (

              <div
                key={log.id}
                className="text-sm"
              >

                {log.message}

              </div>

            )
          )

        }

      </div>

    </div>

  );

}

export default memo(
  AdminActivityFeed
);