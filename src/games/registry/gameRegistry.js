import BlackPearlRush from "../black-pearl-rush";

/**
 * 🎮 GAME REGISTRY - SINGLE SOURCE OF TRUTH
 */

const gameRegistry = {
  "black-pearl-rush": {
    id: "black-pearl-rush",
    name: "Black Pearl Rush",
    component: BlackPearlRush,
    status: "LIVE",
    leaderboardEnabled: true,
  },
};

export function getGame(id) {
  return gameRegistry[id] || null;
}

export function getAllGames() {
  return Object.values(gameRegistry);
}

export default gameRegistry;