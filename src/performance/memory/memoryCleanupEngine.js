import {
  clearRealtimeCache,
} from "../cache/lightweightRealtimeCache";

export function initializeMemoryCleanup() {

  setInterval(() => {

    clearRealtimeCache();

    console.log(
      "🧹 Memory cleanup completed"
    );

  }, 60000);

}