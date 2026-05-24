import {
  Navigate,
} from "react-router-dom";

import useAdminAuthStore from "./adminAuthStore";

function AdminProtectedRoute({
  children,
}) {

  const authenticated =
    useAdminAuthStore(
      (
        state
      ) =>
        state.authenticated
    );

  if (
    !authenticated
  ) {

    return (

      <Navigate
        to="/admin/login"
        replace
      />

    );

  }

  return children;

}

export default
  AdminProtectedRoute;