import {
  initializeSocket,
} from "./socketLifecycle";

import {
  registerRealtimeSync,
} from "./registerRealtimeSync";

let cleanupSync =
  null;

export function bootstrapRealtime() {

  initializeSocket();

  cleanupSync =
    registerRealtimeSync();

  console.log(
    "🟢 REALTIME READY"
  );

  return () => {

    cleanupSync?.();

  };

}