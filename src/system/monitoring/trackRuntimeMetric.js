import runtimeMetrics from "./runtimeMetrics";

export function trackRuntimeMetric({
  key,
  value,
}) {

  runtimeMetrics[key] =
    value;

}