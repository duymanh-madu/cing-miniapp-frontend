import { telemetry } from "./telemetry";

class RuntimeTracer {

  trace(module: string, phase: string, meta?: any) {
    telemetry.record("RUNTIME_TRACE", {
      module,
      phase,
      meta,
    });
  }

  error(module: string, error: any) {
    telemetry.record("RUNTIME_ERROR", {
      module,
      error: String(error),
    });
  }

}

export const runtimeTracer = new RuntimeTracer();
