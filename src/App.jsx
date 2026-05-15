import {
  lazy,
  Suspense,
} from "react";

import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import CustomerAppShell from "@/core/app-shell/customerAppShell";

import ActivationGate from "@/zalo/activation/components/ActivationGate";

import ActivationLoader from "@/components/activation/ActivationLoader";

import RealtimeProvider from "@/providers/RealtimeProvider";

import RealtimeStatusBadge from "@/components/system/RealtimeStatusBadge";

/**
 * =====================================================
 * CUSTOMER PAGES
 * =====================================================
 */

const HomePage =
  lazy(() =>
    import(
      "@/pages/home/HomePage"
    )
  );

const MenuPage =
  lazy(() =>
    import(
      "@/pages/menu/MenuPage"
    )
  );

const GamePage =
  lazy(() =>
    import(
      "@/pages/game/GamePage"
    )
  );

const VoucherPage =
  lazy(() =>
    import(
      "@/pages/voucher/VoucherPage"
    )
  );

/**
 * =====================================================
 * ADMIN
 * =====================================================
 */

const AdminApp =
  lazy(() =>
    import(
      "@/admin/AdminApp"
    )
  );

/**
 * =====================================================
 * APP
 * =====================================================
 */

function App() {

  return (

    <RealtimeProvider>

      <ActivationGate>

        <Suspense
          fallback={
            <ActivationLoader />
          }
        >

          <Routes>

            <Route
              path="/"
              element={

                <CustomerAppShell>

                  <HomePage />

                </CustomerAppShell>

              }
            />

            <Route
              path="/menu"
              element={

                <CustomerAppShell>

                  <MenuPage />

                </CustomerAppShell>

              }
            />

            <Route
              path="/game"
              element={

                <CustomerAppShell>

                  <GamePage />

                </CustomerAppShell>

              }
            />

            <Route
              path="/voucher"
              element={

                <CustomerAppShell>

                  <VoucherPage />

                </CustomerAppShell>

              }
            />

            <Route
              path="/admin/*"
              element={
                <AdminApp />
              }
            />

            <Route
              path="*"
              element={

                <Navigate
                  to="/"
                  replace
                />

              }
            />

          </Routes>

          <RealtimeStatusBadge />

        </Suspense>

      </ActivationGate>

    </RealtimeProvider>

  );

}

export default App;