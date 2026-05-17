import {
  useRuntimeStore,
} from "../store/runtimeStore";

export function auditMemoryPressure() {

  if (

    performance.memory &&
    performance.memory.usedJSHeapSize >
    150000000

  ) {

    useRuntimeStore
      .getState()
      .incrementMemoryWarnings();

  }

}