import {
  useMemo,
} from "react";

import runtimeBindingResolver from "@/core/runtime-bindings/runtimeBindingResolver";

function useRuntimeBindings({
  bindings,
  state,
}) {

  return useMemo(
    () => {

      return runtimeBindingResolver
        .resolve({

          bindings,

          state,

        });

    },
    [
      bindings,
      state,
    ]
  );

}

export default
  useRuntimeBindings;