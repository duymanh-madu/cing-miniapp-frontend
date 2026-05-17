import {
  useRuntimeStore,
} from "../store/runtimeStore";

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

    console.warn(
      "Duplicate listeners detected"
    );

  }

}