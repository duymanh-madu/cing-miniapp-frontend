import BlackPearlRush from "../black-pearl-rush";
import CingStackTower from "../cing-stack-tower";

const gameRegistry = {
  "black-pearl-rush": {
    id: "black-pearl-rush",
    name: "black-pearl-rush",
    displayName: "Bay cùng trân châu",
    component: BlackPearlRush,
    status: "LIVE",
    leaderboardEnabled: true,
  },
  "cing-stack-tower": {
    id: "cing-stack-tower",
    name: "cing-stack-tower",
    displayName: "Xếp Tháp Cing",
    component: CingStackTower,
    status: "LIVE",
    leaderboardEnabled: true,
  },
};

export function getGame(id) { return gameRegistry[id] || null; }
export function getAllGames() { return Object.values(gameRegistry); }
export default gameRegistry;
