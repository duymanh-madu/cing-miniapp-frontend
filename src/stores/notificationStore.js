import {
  create,
} from "zustand";

/**
 * ============================================
 * NOTIFICATION STORE
 * ============================================
 */

const useNotificationStore =
  create((set) => ({
    /**
     * STATE
     */

    notifications: [],

    unreadCount: 0,

    /**
     * ACTIONS
     */

    setNotifications:
      (
        notifications
      ) =>
        set({
          notifications,
        }),

    pushNotification:
      (
        notification
      ) =>
        set((state) => ({
          notifications: [
            notification,

            ...state.notifications,
          ],

          unreadCount:
            state.unreadCount +
            1,
        })),

    markAllRead:
      () =>
        set({
          unreadCount: 0,
        }),
  }));

export default useNotificationStore;