import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {

  useRuntimeStore,
} from "@/core/store/runtimeStore";

export function auditDuplicateListeners({

  count,

  limit,

}) {

  if (

    count > limit

  ) {

    useRuntimeStore
      .getState()
      .incrementDuplicateListeners();

    runtimeLogger.warn("RUNTIME", 
      "Duplicate listeners detected"
    );

  }

}