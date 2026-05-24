import { create }
  from "zustand";

export const useNotificationStore =
  create((set) => ({

    notifications: [],

    pushNotification(
      notification
    ) {

      set((state) => ({

        notifications: [

          notification,

          ...state.notifications,

        ].slice(0, 30),

      }));

    },

    removeNotification(id) {

      set((state) => ({

        notifications:

          state.notifications.filter(

            (item) =>

              item.id !== id

          ),

      }));

    },

  }));