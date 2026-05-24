import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

/**
 * =========================================================
 * OFFLINE MUTATION QUEUE
 * =========================================================
 */

class OfflineMutationQueue {
  queue = [];

  enqueue(mutation) {
    if (
      typeof mutation !==
      "function"
    ) {
      return;
    }

    this.queue.push(mutation);
  }

  async flush() {
    const mutations = [
      ...this.queue,
    ];

    this.queue = [];

    for (const mutation of mutations) {
      try {
        await mutation();
      } catch (error) {
        runtimeLogger.error("APP", 
          "[OFFLINE MUTATION ERROR]",
          error
        );
      }
    }
  }

  size() {
    return this.queue.length;
  }
}

const offlineMutationQueue =
  new OfflineMutationQueue();

export default offlineMutationQueue;