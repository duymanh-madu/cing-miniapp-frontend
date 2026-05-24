import {
  lazy,
  Suspense,
} from "react";

import {
  HashRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "@/layouts/AppLayout";

import AppLoadingScreen from "@/app/AppLoadingScreen";

import RouteTransitionWrapper from "@/layout/components/RouteTransitionWrapper";

/**
 * =====================================================
 * LAZY RUNTIME ROUTES
 * =====================================================
 * WEBVIEW OPTIMIZED
 * MOBILE FIRST
 * CHUNK SAFE
 * =====================================================
 */

const HomePage =
  lazy(() =>
    import("@/pages/HomePage")
  );

const MenuPage =
  lazy(() =>
    import("@/features/menu")
      .then(
        (
          module
        ) => ({

          default:
            module.MenuPage,

        })
      )
  );

const AccountPage =
  lazy(() =>
    import("@/features/account")
      .then(
        (
          module
        ) => ({

          default:
            module.AccountPage,

        })
      )
  );

  const GameCenterPage =
  lazy(() =>
    import("@/games/GameCenterPage")
  );

const GamePage =
  lazy(() =>
    import("@/features/game")
      .then(
        (
          module
        ) => ({

          default:
            module.GamePage,

        })
      )
  );

const LeaderboardPage =
  lazy(() =>
    import("@/features/leaderboard")
      .then(
        (
          module
        ) => ({

          default:
            module.LeaderboardPage,

        })
      )
  );

const PaymentExperiencePage =
  lazy(() =>
    import("@/payment/pages/PaymentExperiencePage")
  );

const OrderExperiencePage =
  lazy(() =>
    import("@/order/pages/OrderExperiencePage")
  );

/**
 * =====================================================
 * ROUTE FALLBACK
 * =====================================================
 */

function RouteFallback() {

  return (
    <AppLoadingScreen />
  );

}

/**
 * =====================================================
 * APP ROUTER
 * =====================================================
 * ZALO WEBVIEW FIRST
 * MOBILE FIRST
 * LAZY HYDRATED
 * REALTIME SAFE
 * =====================================================
 */

function AppRouter() {

  return (

    <HashRouter>

      <AppLayout>

        <Suspense
          fallback={
            <RouteFallback />
          }
        >

          <RouteTransitionWrapper>

            <Routes>

            {/* =========================================
             HOME
            ========================================== */}

            <Route
              path="/"
              element={
                <HomePage />
              }
            />

            {/* =========================================
             MENU
            ========================================== */}

            <Route
              path="/menu"
              element={
                <MenuPage />
              }
            />

            {/* =========================================
             GAME
            ========================================== */}

<Route path="/game-center" element={<GameCenterPage />} />

            <Route
              path="/game"
              element={
                <GamePage />
              }
            />

            {/* =========================================
             LEADERBOARD
            ========================================== */}

            <Route
              path="/leaderboard"
              element={
                <LeaderboardPage />
              }
            />

            {/* =========================================
             PAYMENT
            ========================================== */}

            <Route
              path="/payment"
              element={
                <PaymentExperiencePage />
              }
            />

            <Route
              path="/payment/banking"
              element={
                <PaymentExperiencePage />
              }
            />

            {/* =========================================
             ORDER
            ========================================== */}

            <Route
              path="/order"
              element={
                <OrderExperiencePage />
              }
            />

            <Route
              path="/orders"
              element={
                <OrderExperiencePage />
              }
            />

            {/* =========================================
             ACCOUNT
            ========================================== */}

            <Route
              path="/account"
              element={
                <AccountPage />
              }
            />

            {/* =========================================
             FALLBACK
            ========================================== */}

            <Route
              path="*"
              element={
                <Navigate
                  replace
                  to="/"
                />
              }
            />

            </Routes>

          </RouteTransitionWrapper>

        </Suspense>

      </AppLayout>

    </HashRouter>

  );

}

export default
  AppRouter;