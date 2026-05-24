import {
  useEffect,
} from "react";

import useAppStore from "../stores/app/appStore";

import {
  getUser,
  saveToken,
  saveUser,
} from "../features/auth/authStorage";

import {
  loginGuest,
} from "../features/auth/authService";

/**
 * ============================================
 * USE AUTH
 * ============================================
 */

function useAuth() {
  const user =
    useAppStore(
      (state) =>
        state.user
    );

  const authenticated =
    useAppStore(
      (state) =>
        state.authenticated
    );

  const setUser =
    useAppStore(
      (state) =>
        state.setUser
    );

  const setAuthenticated =
    useAppStore(
      (state) =>
        state.setAuthenticated
    );

  /**
   * BOOT AUTH
   */

  useEffect(() => {
    const localUser =
      getUser();

    if (localUser) {
      setUser(localUser);

      setAuthenticated(
        true
      );
    }
  }, [
    setUser,
    setAuthenticated,
  ]);

  /**
   * LOGIN
   */

  async function login() {
    const result =
      await loginGuest();

    if (
      result.success
    ) {
      saveToken(
        result.token
      );

      saveUser(
        result.user
      );

      setUser(
        result.user
      );

      setAuthenticated(
        true
      );
    }

    return result;
  }

  return {
    user,

    authenticated,

    login,
  };
}

export default useAuth;