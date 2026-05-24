import { create } from "zustand";

interface NotificationRuntimeState {

  unreadCount: number;

  notifications: any[];

  setNotifications: (
    payload: any[]
  ) => void;

  setUnreadCount: (
    value: number
  ) => void;

}

export const useNotificationRuntimeStore =
  create<NotificationRuntimeState>(

    (
      set
    ) => ({

      unreadCount: 0,

      notifications: [],

      setNotifications: (
        payload
      ) => set({

        notifications:
          payload,

      }),

      setUnreadCount: (
        value
      ) => set({

        unreadCount:
          value,

      }),

    })

  );