import {
  Navigate,
} from "react-router-dom";

import {
  useAuthSession,
} from "./useAuthSession";

function RequireAuth({
  children,
}) {

  const {
    authenticated,
  } =
    useAuthSession();

  if (
    !authenticated
  ) {

    return (
      <Navigate
        replace
        to="/"
      />
    );

  }

  return children;

}

export default
  RequireAuth;