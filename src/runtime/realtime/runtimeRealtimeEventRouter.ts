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

    console.warn(
      "[REALTIME] No handler for event",
      eventName
    );

    return;
  }

  handler(
    payload
  );

}