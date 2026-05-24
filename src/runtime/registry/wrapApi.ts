import { apiRegistry } from "./apiRegistry";

export function registerApi(name: string, fn: Function, meta?: any) {
  apiRegistry.register(name, {
    type: "FUNCTION",
    meta,
  });

  return fn;
}
