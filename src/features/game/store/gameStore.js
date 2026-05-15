import {
  create,
} from "zustand";

const useGameStore =
  create(
    (set) => ({

      playing: false,

      score: 0,

      setPlaying:
        (playing) => {

          set({
            playing,
          });

        },

      finish:
        (score) => {

          set({
            playing: false,
            score,
          });

        },

    })
  );

export default
  useGameStore;