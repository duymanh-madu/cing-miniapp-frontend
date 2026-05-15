import runtimeMetrics from "./runtimeMetrics";

export function getRuntimeHealth() {

  return {

    uptime:

      Date.now() -

      runtimeMetrics
        .appStartedAt,

    totalErrors:

      runtimeMetrics
        .totalErrors,

    lastRealtimeSyncAt:

      runtimeMetrics
        .lastRealtimeSyncAt,

  };

}