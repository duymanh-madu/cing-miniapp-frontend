import realtimeChannelRegistry from "@/services/realtime/realtimeChannelRegistry";

/**
 * =========================================================
 * IPOS REALTIME SYNC
 * =========================================================
 */

class IposRealtimeSync {

  register() {

    realtimeChannelRegistry.register({

      channel:
        "ipos-menu",

      handlers: {

        updated:
          this.handleMenu,

      },

    });

  }

  handleMenu = (
    payload
  ) => {

    console.log(
      "[IPOS MENU UPDATED]",
      payload
    );

  };

}

const iposRealtimeSync =
  new IposRealtimeSync();

export default
  iposRealtimeSync;