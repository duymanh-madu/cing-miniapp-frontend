import { create } from "zustand";

const useLeaderboardStore = create((set, get) => ({

  entries: [],

  previousEntries: [],

  setEntries: (entries) => {

    const prev = get().entries;

    set({
      previousEntries: prev,
      entries
    });

    // trigger diff detection
    get().detectChanges(prev, entries);

  },

  // EVENT HOOKS
  listeners: [],

  subscribe: (fn) => {
    set((state) => ({
      listeners: [...state.listeners, fn]
    }));
  },

  emit: (event, payload) => {
    get().listeners.forEach(fn => fn(event, payload));
  },

  // DIFF ENGINE
  detectChanges: (prev, next) => {

    const mapPrev = new Map(prev.map(u => [u.id, u]));
    const mapNext = new Map(next.map(u => [u.id, u]));

    next.forEach((user, index) => {

      const old = mapPrev.get(user.id);
      const newRank = index + 1;

      if (!old) {
        get().emit("NEW_ENTRY", { user, rank: newRank });
        return;
      }

      const oldRank = prev.findIndex(u => u.id === user.id) + 1;

      if (newRank < oldRank) {
        get().emit("RANK_UP", {
          user,
          from: oldRank,
          to: newRank
        });
      }

      if (newRank <= 3) {
        get().emit("TOP_3", { user, rank: newRank });
      }

      if (newRank <= 10) {
        get().emit("TOP_10", { user, rank: newRank });
      }

    });

  }

}));

export default useLeaderboardStore;