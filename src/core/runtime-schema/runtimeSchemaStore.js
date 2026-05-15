import {
  create,
} from "zustand";

const useRuntimeSchemaStore =
  create(
    (
      set
    ) => ({

      activeSchemas:
        {},

      compiledSchemas:
        {},

      schemaVersions:
        {},

      setActiveSchema:
        (
          key,
          schema
        ) => {

          set(
            (
              state
            ) => ({

              activeSchemas: {

                ...state.activeSchemas,

                [key]:
                  schema,

              },

            })
          );

        },

      setCompiledSchema:
        (
          key,
          schema
        ) => {

          set(
            (
              state
            ) => ({

              compiledSchemas: {

                ...state.compiledSchemas,

                [key]:
                  schema,

              },

            })
          );

        },

      setSchemaVersion:
        (
          key,
          version
        ) => {

          set(
            (
              state
            ) => ({

              schemaVersions: {

                ...state.schemaVersions,

                [key]:
                  version,

              },

            })
          );

        },

    })
  );

export default
  useRuntimeSchemaStore;