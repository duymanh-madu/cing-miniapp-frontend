import {
  create,
} from "zustand";

const useAiInsightsStore =
  create(
    (
      set
    ) => ({

      recommendations:
        [],

      aiInsights:
        [],

      aiPredictions:
        [],

      setRecommendations:
        (
          recommendations
        ) => {

          set({
            recommendations,
          });

        },

      setAiInsights:
        (
          aiInsights
        ) => {

          set({
            aiInsights,
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

    })
  );

export default
  useAiInsightsStore;