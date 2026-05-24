import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

export function showRuntimeToast(
  payload: {

    title: string;

    message: string;

  }
) {

  runtimeLogger.info("RUNTIME", 
    "[TOAST]",
    payload.title,
    payload.message
  );

}