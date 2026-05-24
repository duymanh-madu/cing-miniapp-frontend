import {
  create,
} from "zustand";

const useAiDecisionStore =
  create(
    (
      set
    ) => ({

      aiDecisions:
        [],

      aiPredictions:
        [],

      anomalyDetections:
        [],

      setAiDecisions:
        (
          aiDecisions
        ) => {

          set({
            aiDecisions,
          });

        },

      setAiPredictions:
        (
          aiPredictions
        ) => {

          set({
            aiPredictions,
          });

        },

      appendAnomalyDetection:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              anomalyDetections: [

                payload,

                ...state.anomalyDetections,

              ].slice(
                0,
                100
              ),

            })
          );

        },

    })
  );

export default
  useAiDecisionStore;