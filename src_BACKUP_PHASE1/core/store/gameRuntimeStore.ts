import { create } from "zustand";

interface GameRuntimeState {

  leaderboardRank:
    number;

  totalScore:
    number;

  totalPlays:
    number;

  setGameState: (
    payload: {

      leaderboardRank:
        number;

      totalScore:
        number;

      totalPlays:
        number;

    }
  ) => void;

}

export const useGameRuntimeStore =
  create<GameRuntimeState>(

    (
      set
    ) => ({

      leaderboardRank:
        0,

      totalScore:
        0,

      totalPlays:
        0,

      setGameState: (
        payload
      ) => set({

        leaderboardRank:
          payload.leaderboardRank,

        totalScore:
          payload.totalScore,

        totalPlays:
          payload.totalPlays,

      }),

    })

  );