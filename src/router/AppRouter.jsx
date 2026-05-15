import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "@/layouts/AppLayout";

import {
  MenuPage,
} from "@/features/menu";

import {
  AccountPage,
} from "@/features/account";

import {
  GamePage,
} from "@/features/game";

import {
  LeaderboardPage,
} from "@/features/leaderboard";

import HomePage from "@/pages/HomePage";

/**
 * =========================================================
 * APP ROUTER
 * =========================================================
 */

function AppRouter() {

  return (

    <BrowserRouter>

      <AppLayout>

        <Routes>

          <Route
            path="/"
            element={
              <HomePage />
            }
          />

          <Route
            path="/menu"
            element={
              <MenuPage />
            }
          />

          <Route
            path="/game"
            element={
              <GamePage />
            }
          />

          <Route
            path="/leaderboard"
            element={
              <LeaderboardPage />
            }
          />

          <Route
            path="/account"
            element={
              <AccountPage />
            }
          />

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

      </AppLayout>

    </BrowserRouter>

  );

}

export default
  AppRouter;