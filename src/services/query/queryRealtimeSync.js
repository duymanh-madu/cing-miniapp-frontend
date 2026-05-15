import realtimeChannelRegistry from "@/services/realtime/realtimeChannelRegistry";

import queryInvalidationService from "@/services/query/queryInvalidationService";

import queryKeys from "@/services/query/queryKeys";

/**
 * =========================================================
 * QUERY REALTIME SYNC
 * =========================================================
 */

class QueryRealtimeSync {
  register() {
    realtimeChannelRegistry.register({
      channel: "menu",

      handlers: {
        updated: () => {
          queryInvalidationService.invalidate(
            queryKeys.menu.list()
          );
        },
      },
    });

    realtimeChannelRegistry.register({
      channel: "campaign",

      handlers: {
        updated: () => {
          queryInvalidationService.invalidate(
            queryKeys.campaign.feed()
          );
        },
      },
    });

    realtimeChannelRegistry.register({
      channel: "voucher",

      handlers: {
        updated: () => {
          queryInvalidationService.invalidate(
            queryKeys.voucher.member()
          );
        },
      },
    });
  }
}

const queryRealtimeSync =
  new QueryRealtimeSync();

export default queryRealtimeSync;