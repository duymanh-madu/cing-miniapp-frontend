import {
  create,
} from "zustand";

const useNotificationStore =
  create(
    (
      set
    ) => ({

      notifications:
        [],

      pushNotification:
        (
          notification
        ) => {

          set(
            (
              state
            ) => ({

              notifications:
                [

                  notification,

                  ...state.notifications,

                ],

            })
          );

        },

      clearNotifications:
        () => {

          set({

            notifications:
              [],

          });

        },

    })
  );

export default
  useNotificationStore;