import {
  create,
} from "zustand";

const realtimeGameStore =
  create((set) => ({

    gameRunning:
      false,

    score:
      0,

    bestScore:
      0,

    combo:
      0,

    tick:
      0,

    leaderboard:
      [],

    obstacles:
      [],

    setGameRunning:
      (value) =>
        set({
          gameRunning:
            value,
        }),

    setScore:
      (value) =>
        set({
          score:
            value,
        }),

    setBestScore:
      (value) =>
        set({
          bestScore:
            value,
        }),

    setCombo:
      (value) =>
        set({
          combo:
            value,
        }),

    setLeaderboard:
      (value) =>
        set({
          leaderboard:
            value,
        }),

    setObstacles:
      (value) =>
        set({
          obstacles:
            value,
        }),

    increaseTick:
      () =>
        set(
          (
            state
          ) => ({
            tick:
              state.tick + 1,
          })
        ),

  }));

export default
  realtimeGameStore;