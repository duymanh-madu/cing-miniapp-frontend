import {
  useMemo,
} from "react";

import schemaRuntimeCompiler from "@/core/schema-runtime/schemaRuntimeCompiler";

function useRuntimeSchema(
  schema
) {

  return useMemo(
    () => {

      return schemaRuntimeCompiler
        .compile(
          schema
        );

    },
    [
      schema,
    ]
  );

}

export default
  useRuntimeSchema;