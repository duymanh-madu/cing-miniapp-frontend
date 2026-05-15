import {
  create,
} from "zustand";

const useRuntimeDiagnosticsStore =
  create(
    (
      set
    ) => ({

      runtimeErrors:
        [],

      diagnostics:
        [],

      runtimeWarnings:
        [],

      appendRuntimeError:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              runtimeErrors: [

                payload,

                ...state.runtimeErrors,

              ].slice(
                0,
                200
              ),

            })
          );

        },

      appendDiagnostic:
        (
          payload
        ) => {

          set(
            (
            state
            ) => ({

              diagnostics: [

                payload,

                ...state.diagnostics,

              ].slice(
                0,
                200
              ),

            })
          );

        },

      appendRuntimeWarning:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              runtimeWarnings: [

                payload,

                ...state.runtimeWarnings,

              ].slice(
                0,
                200
              ),

            })
          );

        },

    })
  );

export default
  useRuntimeDiagnosticsStore;