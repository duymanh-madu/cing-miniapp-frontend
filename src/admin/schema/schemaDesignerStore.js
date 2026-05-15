import {
  create,
} from "zustand";

const useSchemaDesignerStore =
  create(
    (
      set
    ) => ({

      schemas:
        [],

      selectedSchema:
        null,

      runtimeSchema:
        null,

      setSchemas:
        (
          schemas
        ) => {

          set({
            schemas,
          });

        },

      setSelectedSchema:
        (
          selectedSchema
        ) => {

          set({
            selectedSchema,
          });

        },

      setRuntimeSchema:
        (
          runtimeSchema
        ) => {

          set({
            runtimeSchema,
          });

        },

    })
  );

export default
  useSchemaDesignerStore;