import { apiRegistry } from "../registry/apiRegistry";
import { traceApiCall } from "@/runtime/control-plane/controlPlaneBridge";
import { dataContractExplorer } from "@/runtime/data-contract/dataContractExplorer";

import { traceApi } from "@/runtime/xray/xrayHook";

export function instrumentApi(name: string, fn: Function, meta?: any) {

  apiRegistry.register(name, {
    type: typeof fn,
    meta,
    autoInstrumented: true,
  });

  return function (...args: any[]) {

    const result = fn(...args);

    dataContractExplorer.analyze(name, {
      args,
      result,
    });

    traceApiCall(name, args);

    return result;

  };

}
