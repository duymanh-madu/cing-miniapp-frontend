import { lazy } from "react";

const gameModules = {
  "black-pearl-rush": lazy(() => import("../../games/black-pearl-rush")),
  "cing-stack-tower": lazy(() => import("../../games/cing-stack-tower")),
  "cing-artillery": lazy(() => import("../../games/cing-artillery")),
};

export default function GameLoader({ gameId, onGameOver }) {
  const Component = gameModules[gameId];
  if (!Component) return <div>Game Not Found</div>;
  return <Component onGameOver={onGameOver} />;
}
