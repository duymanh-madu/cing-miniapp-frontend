import {
  create,
} from "zustand";

const useNotificationStore =
  create(
    (set) => ({

      notifications: [],

      push:
        (notification) => {

          set((state) => ({

            notifications: [
              notification,
              ...state.notifications,
            ],

          }));

        },

      remove:
        (id) => {

          set((state) => ({

            notifications:
              state.notifications.filter(
                (
                  notification
                ) =>
                  notification.id !== id
              ),

          }));

        },

    })
  );

export default
  useNotificationStore;