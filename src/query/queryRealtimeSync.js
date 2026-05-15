import {
  REALTIME_EVENTS,
} from "@/realtime/realtimeEvents";

import {
  onRealtimeEvent,
} from "@/realtime/realtimeRegistry";

import {
  QUERY_KEYS,
} from "./queryKeys";

import {
  invalidateQuery,
} from "./invalidateQuery";

export function registerQueryRealtimeSync() {

  const unsubscribers =
    [];

  unsubscribers.push(

    onRealtimeEvent(

      REALTIME_EVENTS
        .MENU_UPDATED,

      () => {

        invalidateQuery(
          QUERY_KEYS.MENU
        );

      }

    )

  );

  unsubscribers.push(

    onRealtimeEvent(

      REALTIME_EVENTS
        .VOUCHER_UPDATED,

      () => {

        invalidateQuery(
          QUERY_KEYS.VOUCHERS
        );

      }

    )

  );

  unsubscribers.push(

    onRealtimeEvent(

      REALTIME_EVENTS
        .CAMPAIGN_UPDATED,

      () => {

        invalidateQuery(
          QUERY_KEYS.CAMPAIGNS
        );

      }

    )

  );

  return () => {

    unsubscribers.forEach(
      (
        unsubscribe
      ) => {

        unsubscribe?.();

      }
    );

  };

}