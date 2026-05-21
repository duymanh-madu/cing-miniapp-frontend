import { create } from "zustand";

import {
  RuntimeNotification,
} from "./runtimeNotificationTypes";

interface RuntimeNotificationState {

  notifications:
    RuntimeNotification[];

  unreadCount:
    number;

  pushNotification: (
    notification: RuntimeNotification
  ) => void;

  markAsRead: (
    notificationId: string
  ) => void;

}

export const useRuntimeNotificationStore =
  create<RuntimeNotificationState>(

    (
      set,
      get
    ) => ({

      notifications:
        [],

      unreadCount:
        0,

      pushNotification: (
        notification
      ) => {

        const next =
          [

            notification,

            ...get()
              .notifications,

          ];

        set({

          notifications:
            next,

          unreadCount:
            next.filter(
              (
                item
              ) => !item.read
            ).length,

        });

      },

      markAsRead: (
        notificationId
      ) => {

        const updated =
          get()
            .notifications
            .map(

              (
                item
              ) => {

                if (
                  item.id ===
                  notificationId
                ) {

                  return {

                    ...item,

                    read:
                      true,

                  };

                }

                return item;

              }

            );

        set({

          notifications:
            updated,

          unreadCount:
            updated.filter(
              (
                item
              ) => !item.read
            ).length,

        });

      },

    })

  );