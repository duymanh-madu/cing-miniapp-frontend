import {
  create,
} from "zustand";

/**
 * ============================================
 * APP STORE
 * ============================================
 */

const useAppStore =
  create((set) => ({
    /**
     * APP
     */

    appReady: false,

    appBooting: true,

    /**
     * AUTH
     */

    authenticated: false,

    user: null,

    /**
     * SOCKET
     */

    socketConnected: false,

    reconnecting: false,

    /**
     * MEMBER
     */

    memberPoints: 0,

    memberTier: "Silver",

    /**
     * GAME
     */

    gamePlaying: false,

    /**
     * NOTIFICATIONS
     */

    unreadNotifications: 0,

    /**
     * ACTIONS
     */

    setAppReady:
      (value) =>
        set({
          appReady: value,
        }),

    setAppBooting:
      (value) =>
        set({
          appBooting: value,
        }),

    setAuthenticated:
      (value) =>
        set({
          authenticated:
            value,
        }),

    setUser: (
      user
    ) =>
      set({
        user,
      }),

    setSocketConnected:
      (value) =>
        set({
          socketConnected:
            value,
        }),

    setReconnecting:
      (value) =>
        set({
          reconnecting:
            value,
        }),

    setMemberPoints:
      (points) =>
        set({
          memberPoints:
            points,
        }),

    setMemberTier:
      (tier) =>
        set({
          memberTier: tier,
        }),

    setGamePlaying:
      (value) =>
        set({
          gamePlaying:
            value,
        }),

    incrementNotifications:
      () =>
        set((state) => ({
          unreadNotifications:
            state.unreadNotifications +
            1,
        })),

    clearNotifications:
      () =>
        set({
          unreadNotifications: 0,
        }),
  }));

export default useAppStore;