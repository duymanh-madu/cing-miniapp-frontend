import {
  lazy,
  Suspense,
} from "react";

import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AdminAppShell from "@/core/app-shell/adminAppShell";

import AdminProtectedRoute from "@/admin/auth/AdminProtectedRoute";

const AdminLoginPage =
  lazy(() =>
    import(
      "@/admin/au../features/AdminLoginPage"
    )
  );

const AdminDashboardPage =
  lazy(() =>
    import(
      "@/admin/dashboa../features/AdminDashboardPage"
    )
  );

function AdminApp() {

  return (

    <AdminAppShell>

      <Suspense
        fallback={null}
      >

        <Routes>

          <Route
            path="/login"
            element={
              <AdminLoginPage />
            }
          />

          <Route
            path="/dashboard"
            element={

              <AdminProtectedRoute>

                <AdminDashboardPage />

              </AdminProtectedRoute>

            }
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/admin/dashboard"
                replace
              />
            }
          />

        </Routes>

      </Suspense>

    </AdminAppShell>

  );

}

export default
  AdminApp;