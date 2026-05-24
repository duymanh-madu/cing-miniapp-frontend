import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

export function logBootstrap({
  layer,
}) {
  runtimeLogger.info(
    "BOOTSTRAP",
    `${layer} initialized`
  );
}
