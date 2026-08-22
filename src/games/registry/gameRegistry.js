import BlackPearlRush from "../black-pearl-rush";
import CingStackTower from "../cing-stack-tower";
import CingBlockPuzzle from "../cing-block-puzzle";

import {
  GAME_RUNTIME_AUTHORITY,
} from "./gameRuntimeAuthority.js";

const gameRegistry = {
  "black-pearl-rush": {
    id: "black-pearl-rush",
    name: "black-pearl-rush",
    displayName: "Bay cùng trân châu",
    description: "Thử thách phản xạ — ghi điểm cao nhất",
    iconUrl: "/game-icons/black-pearl-rush.svg",
    iconFallback: "🧋",
    component: BlackPearlRush,
    status: "LIVE",
    leaderboardEnabled: true,
    runtimeAuthority:
      GAME_RUNTIME_AUTHORITY
        .LEGACY_GENERIC,
  },
  "cing-stack-tower": {
    id: "cing-stack-tower",
    name: "cing-stack-tower",
    displayName: "Xếp Tháp Cing",
    description: "Xếp tháp càng cao — leo top càng nhanh",
    iconUrl: "/game-icons/cing-stack-tower.svg",
    iconFallback: "🧱",
    component: CingStackTower,
    status: "LIVE",
    leaderboardEnabled: true,
    runtimeAuthority:
      GAME_RUNTIME_AUTHORITY
        .LEGACY_GENERIC,
  },

  "cing-block-puzzle": {
    id: "cing-block-puzzle",
    name: "cing-block-puzzle",
    displayName:
      "Cing Block Puzzle",
    description:
      "Xếp khối 8×8 · Phá hàng, phá cột · Leo bảng xếp hạng",
    iconUrl: null,
    iconFallback: "🧩",
    component: CingBlockPuzzle,
    status: "LIVE",
    leaderboardEnabled: true,
    runtimeAuthority:
      GAME_RUNTIME_AUTHORITY
        .SELF_MANAGED,
  },
};

export function getGame(id) { return gameRegistry[id] || null; }
export function getAllGames() { return Object.values(gameRegistry); }
export default gameRegistry;
