import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import {
  Suspense,
} from "react";

import MobileLayout
  from "@/layouts/MobileLayout";

import RuntimeProvider
  from "@/providers/RuntimeProvider";

import HomePage
  from "@/pages/HomePage";

import MenuPage
  from "@/pages/MenuPage";

import GamePage
  from "@/pages/GamePage";

import LeaderboardPage
  from "@/pages/LeaderboardPage";

import AccountPage
  from "@/pages/AccountPage";

/**
 * =========================================================
 * ROUTE CONFIG
 * =========================================================
 */

const routes = [

  {
    id: "home",

    path: "/",

    element:
      <HomePage />,
  },

  {
    id: "menu",

    path: "/menu",

    element:
      <MenuPage />,
  },

  {
    id: "game",

    path: "/game",

    element:
      <GamePage />,
  },

  {
    id: "leaderboard",

    path:
      "/leaderboard",

    element:
      <LeaderboardPage />,
  },

  {
    id: "account",

    path:
      "/account",

    element:
      <AccountPage />,
  },

];

/**
 * =========================================================
 * LOADING FALLBACK
 * =========================================================
 */

function RouteFallback() {

  return (

    <div
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-brand-cream
      "
    >

      <div
        className="
          flex
          flex-col
          items-center
          gap-4
        "
      >

        <div
          className="
            h-12
            w-12
            rounded-full
            border-4
            border-brand-orange/20
            border-t-brand-orange
            animate-spin
          "
        />

        <p
          className="
            text-sm
            font-medium
            text-brand-gray
          "
        >
          Đang tải hệ thống...
        </p>

      </div>

    </div>

  );

}

/**
 * =========================================================
 * APP ROUTER
 * =========================================================
 */

function AppRouter() {

  return (

    <BrowserRouter>

      <RuntimeProvider>

        <MobileLayout>

          <Suspense
            fallback={
              <RouteFallback />
            }
          >

            <Routes>

              {
                routes.map(
                  (route) => (

                    <Route
                      key={
                        route.id
                      }

                      path={
                        route.path
                      }

                      element={
                        route.element
                      }
                    />

                  )
                )
              }

              {/* =====================================
                  FALLBACK
              ===================================== */}

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

        </MobileLayout>

      </RuntimeProvider>

    </BrowserRouter>

  );

}

export default
  AppRouter;