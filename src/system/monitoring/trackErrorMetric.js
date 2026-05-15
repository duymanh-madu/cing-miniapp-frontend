import runtimeMetrics from "./runtimeMetrics";

export function trackErrorMetric() {

  runtimeMetrics.totalErrors += 1;

}