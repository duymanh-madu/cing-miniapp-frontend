import {
  useEffect,
} from "react";

import useAuthStore from "../stores/authStore";

import {
  getSession,
} from "../infra/auth/authStorage";

/**
 * ============================================
 * USE AUTH SESSION
 * ============================================
 */

function useAuthSession() {
  const initialize =
    useAuthStore(
      (state) =>
        state.initialize
    );

  useEffect(() => {
    const session =
      getSession();

    if (
      session.accessToken &&
      session.user
    ) {
      initialize({
        initialized: true,

        authenticated: true,

        accessToken:
          session.accessToken,

        refreshToken:
          session.refreshToken,

        user:
          session.user,

        role:
          session.user
            ?.role ||
          "customer",

        permissions:
          session.user
            ?.permissions ||
          [],
      });
    } else {
      initialize({
        initialized: true,

        authenticated: false,

        accessToken: null,

        refreshToken: null,

        user: null,

        role: "guest",

        permissions: [],
      });
    }
  }, [initialize]);
}

export default useAuthSession;