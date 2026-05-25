import BlackPearlRush from "../black-pearl-rush";

const gameRegistry = {
  "black-pearl-rush": {
    id: "black-pearl-rush",
    name: "black-pearl-rush",
    displayName: "Bay cùng trân châu",
    component: BlackPearlRush,
    status: "LIVE",
    leaderboardEnabled: true,
  },
};

export function getGame(id) { return gameRegistry[id] || null; }
export function getAllGames() { return Object.values(gameRegistry); }
export default gameRegistry;
