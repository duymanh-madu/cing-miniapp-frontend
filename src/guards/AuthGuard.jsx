import {
  Navigate,
} from "react-router-dom";

import useAuthStore from "../stores/authStore";

/**
 * ============================================
 * AUTH GUARD
 * ============================================
 */

function AuthGuard({
  children,
}) {
  const authenticated =
    useAuthStore(
      (state) =>
        state.authenticated
    );

  if (
    !authenticated
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}

export default AuthGuard;