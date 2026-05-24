import {
  create,
} from "zustand";

const useRuntimeProfilerStore =
  create(
    (
      set
    ) => ({

      renderProfiles:
        [],

      componentHotspots:
        [],

      runtimeTracing:
        [],

      memorySnapshots:
        [],

      appendRenderProfile:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              renderProfiles: [

                payload,

                ...state.renderProfiles,

              ].slice(
                0,
                100
              ),

            })
          );

        },

      setComponentHotspots:
        (
          componentHotspots
        ) => {

          set({
            componentHotspots,
          });

        },

      setRuntimeTracing:
        (
          runtimeTracing
        ) => {

          set({
            runtimeTracing,
          });

        },

      setMemorySnapshots:
        (
          memorySnapshots
        ) => {

          set({
            memorySnapshots,
          });

        },

    })
  );

export default
  useRuntimeProfilerStore;