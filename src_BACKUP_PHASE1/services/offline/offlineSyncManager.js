import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

const offlineQueue =
  [];

export function enqueueOfflineTask(
  task
) {
  if (
    typeof task !==
    "function"
  ) {
    return;
  }

  offlineQueue.push(task);
}

export async function replayOfflineQueue() {
  while (
    offlineQueue.length
  ) {
    const task =
      offlineQueue.shift();

    try {
      await task?.();
    } catch (error) {
      runtimeLogger.error("APP", 
        "OFFLINE TASK FAILED",
        error
      );
    }
  }
}