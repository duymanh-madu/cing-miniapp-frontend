import socket from "./socket";

import {
  REALTIME_EVENTS,
} from "./realtimeEvents";

import {
  emitRealtimeEvent,
} from "./realtimeRegistry";

import {
  trackRuntimeMetric,
} from "@/system/monitoring";

export function registerRealtimeSync() {

  const events = [

    REALTIME_EVENTS
      .MENU_UPDATED,

    REALTIME_EVENTS
      .VOUCHER_UPDATED,

    REALTIME_EVENTS
      .CAMPAIGN_UPDATED,

    REALTIME_EVENTS
      .LOYALTY_UPDATED,

    REALTIME_EVENTS
      .SYSTEM_UPDATED,

  ];

  events.forEach(
    (event) => {

      socket.on(
        event,
        (
          payload
        ) => {

          trackRuntimeMetric({

            key:
              "lastRealtimeSyncAt",

            value:
              Date.now(),

          });

          emitRealtimeEvent(
            event,
            payload
          );

        }
      );

    }
  );

  return () => {

    events.forEach(
      (
        event
      ) => {

        socket.off(
          event
        );

      }
    );

  };

}