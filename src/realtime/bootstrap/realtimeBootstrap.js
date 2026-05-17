import {
  initializeRealtimeManager,
} from "../services/realtimeConnectionManager";

import {
  initializeHeartbeat,
} from "../services/realtimeHeartbeatService";

import {
  initializeVisibilityRecovery,
} from "../services/realtimeVisibilityRecovery";

export function bootstrapRealtimeLayer() {

  initializeRealtimeManager();

  initializeHeartbeat();

  initializeVisibilityRecovery();

  console.log(
    "⚡ Realtime layer booted"
  );

}