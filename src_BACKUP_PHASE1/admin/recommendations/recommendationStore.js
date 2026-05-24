import {
  create,
} from "zustand";

const useRecommendationStore =
  create(
    (
      set
    ) => ({

      realtimeRecommendations:
        [],

      setRealtimeRecommendations:
        (
          realtimeRecommendations
        ) => {

          set({
            realtimeRecommendations,
          });

        },

      appendRecommendation:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              realtimeRecommendations: [

                payload,

                ...state.realtimeRecommendations,

              ].slice(
                0,
                50
              ),

            })
          );

        },

    })
  );

export default
  useRecommendationStore;