import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import AppRouter from "./AppRouter";

import GameCenterPage
from "../pages/game-center/GameCenterPage";

import GameLoader
from "../game-system/loaders/GameLoader";

import {
  gameRegistry,
} from "../game-system/config/gameRegistry";

/**
 * =========================================
 * DYNAMIC GAME ROUTES
 * =========================================
 */

const gameRoutes =
  gameRegistry.map(
    (game) => (

      <Route
        key={game.id}
        path={game.route}
        element={
          <GameLoader
            gameId={
              game.component
            }
          />
        }
      />

    )
  );

/**
 * =========================================
 * ROUTER
 * =========================================
 */

const router =
  createBrowserRouter(

    createRoutesFromElements(

      <>

        {/* ================================= */}
        {/* MAIN APP */}
        {/* ================================= */}

        <Route
          path="/*"
          element={
            <AppRouter />
          }
        />

        {/* ================================= */}
        {/* GAME CENTER */}
        {/* ================================= */}

        <Route
          path="/games"
          element={
            <GameCenterPage />
          }
        />

        {/* ================================= */}
        {/* DYNAMIC GAMES */}
        {/* ================================= */}

        {gameRoutes}

      </>

    )

  );

export default router;