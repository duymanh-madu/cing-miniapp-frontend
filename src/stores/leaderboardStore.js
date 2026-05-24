import { create } from "zustand";

const useLeaderboardStore = create((set) => ({
  entries: {}, // gameId -> leaderboard list

  setEntries: (gameId, entries) =>
    set((state) => ({
      entries: {
        ...state.entries,
        [gameId]: entries,
      },
    })),

  updateScore: (gameId, player) =>
    set((state) => {
      const list = state.entries[gameId] || [];

      const updated = [...list, player]
        .sort((a, b) => b.score - a.score)
        .slice(0, 100);

      return {
        entries: {
          ...state.entries,
          [gameId]: updated,
        },
      };
    }),
}));

export default useLeaderboardStore;