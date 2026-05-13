import {
  create,
} from "zustand";

/**
 * ============================================
 * AUTH STORE
 * ============================================
 */

const useAuthStore =
  create((set) => ({
    /**
     * STATE
     */

    initialized: false,

    loading: false,

    authenticated: false,

    accessToken: null,

    refreshToken: null,

    user: null,

    role: "guest",

    permissions: [],

    /**
     * ACTIONS
     */

    setLoading:
      (value) =>
        set({
          loading: value,
        }),

    initialize:
      (payload) =>
        set({
          initialized: true,

          authenticated:
            payload.authenticated,

          accessToken:
            payload.accessToken,

          refreshToken:
            payload.refreshToken,

          user:
            payload.user,

          role:
            payload.role,

          permissions:
            payload.permissions ||
            [],
        }),

    login:
      (payload) =>
        set({
          authenticated: true,

          accessToken:
            payload.accessToken,

          refreshToken:
            payload.refreshToken,

          user:
            payload.user,

          role:
            payload.role,

          permissions:
            payload.permissions ||
            [],
        }),

    logout: () =>
      set({
        authenticated: false,

        accessToken: null,

        refreshToken: null,

        user: null,

        role: "guest",

        permissions: [],
      }),
  }));

export default useAuthStore;