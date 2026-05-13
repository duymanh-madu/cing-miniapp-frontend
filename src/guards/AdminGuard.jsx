import {
  Navigate,
} from "react-router-dom";

import useAuthStore from "../stores/authStore";

/**
 * ============================================
 * ADMIN GUARD
 * ============================================
 */

function AdminGuard({
  children,
}) {
  const authenticated =
    useAuthStore(
      (state) =>
        state.authenticated
    );

  const role =
    useAuthStore(
      (state) =>
        state.role
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

  if (
    role !== "admin"
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

export default AdminGuard;