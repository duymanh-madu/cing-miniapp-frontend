/**
 * AUTO SCAN + INSTRUMENT RUNTIME FUNCTIONS
 */

import { instrumentApi } from "./apiInstrumenter";

export function autoInstrumentRuntime(target: any, namespace: string) {

  const keys = Object.keys(target);

  keys.forEach((key) => {

    const value = target[key];

    if (typeof value === "function") {

      target[key] = instrumentApi(
        `${namespace}.${key}`,
        value,
        { source: namespace }
      );

    }

  });

  return target;

}
