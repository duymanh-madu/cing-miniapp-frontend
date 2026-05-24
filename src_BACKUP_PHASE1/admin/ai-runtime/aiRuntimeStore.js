import {
  create,
} from "zustand";

const useAiRuntimeStore =
  create(
    (
      set
    ) => ({

      runtimeModels:
        [],

      activeInference:
        [],

      aiRuntimeMetrics:
        {},

      realtimeInferenceEvents:
        [],

      setRuntimeModels:
        (
          runtimeModels
        ) => {

          set({
            runtimeModels,
          });

        },

      setActiveInference:
        (
          activeInference
        ) => {

          set({
            activeInference,
          });

        },

      setAiRuntimeMetrics:
        (
          aiRuntimeMetrics
        ) => {

          set({
            aiRuntimeMetrics,
          });

        },

      appendInferenceEvent:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              realtimeInferenceEvents: [

                payload,

                ...state.realtimeInferenceEvents,

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
  useAiRuntimeStore;