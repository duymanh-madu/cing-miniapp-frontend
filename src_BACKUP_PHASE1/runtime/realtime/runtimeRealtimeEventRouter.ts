import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {

  realtimeEventHandlers,
} from "./runtimeRealtimeEventHandlers";

export function routeRealtimeEvent(
  eventName: string,
  payload: any
) {

  const handler =
    realtimeEventHandlers[
      eventName as keyof typeof realtimeEventHandlers
    ];

  if (!handler) {

    runtimeLogger.warn("RUNTIME", 
      "[REALTIME] No handler for event",
      eventName
    );

    return;
  }

  handler(
    payload
  );

}