import {
  lazy,
  Suspense,
} from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import CustomerAppShell from "@/core/app-shell/customerAppShell";

import ActivationGate from "@/zalo/activation/components/ActivationGate";

import ActivationLoader from "@/components/activation/ActivationLoader";

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

const AdminApp =
  lazy(() =>
    import(
      "@/admin/AdminApp"
    )
  );

function App() {

  return (

    <BrowserRouter>

      <ActivationGate />

      <ActivationLoader />

      <Suspense
        fallback={null}
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

      </Suspense>

    </BrowserRouter>

  );

}

export default App;