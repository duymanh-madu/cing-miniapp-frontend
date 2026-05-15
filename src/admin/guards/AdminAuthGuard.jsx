import {
  Navigate,
} from "react-router-dom";

import useAdminSession from "@/admin/hooks/useAdminSession";

function AdminAuthGuard({
  children,
}) {

  const session = useAdminSession();

  if (!session?.authenticated) {

    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );

  }

  return children;

}

export default AdminAuthGuard;