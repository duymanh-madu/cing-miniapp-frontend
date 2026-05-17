import {
  memo,
} from "react";

import {
  useNotificationStore,
} from "../store/notificationStore";

import NotificationItem from "./NotificationItem";

function NotificationCenter() {

  const notifications =
    useNotificationStore(
      (state) =>
        state.notifications
    );

  return (

    <div
      className="

        fixed
        top-4
        right-4

        z-[9999]

        flex
        flex-col

        gap-3

        w-[320px]
        max-w-[90vw]

      "
    >

      {

        notifications.map(
          (notification) => (

            <NotificationItem
              key={notification.id}
              title={
                notification.title
              }
              message={
                notification.message
              }
            />

          )
        )

      }

    </div>

  );

}

export default memo(
  NotificationCenter
);