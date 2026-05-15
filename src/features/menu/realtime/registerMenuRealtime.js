import { on }
  from "@/realtime/realtimeEventRouter";

import MENU_REALTIME_EVENTS
  from "./menuRealtimeEvents";

import useMenuStore
  from "@/stores/menuStore";

function registerMenuRealtime() {

  const unsubscribers =
    [];

  unsubscribers.push(

    on(

      MENU_REALTIME_EVENTS
        .MENU_UPDATED,

      (
        product
      ) => {

        useMenuStore
          .getState()
          .upsertProduct(
            product
          );

      }

    )

  );

  unsubscribers.push(

    on(

      MENU_REALTIME_EVENTS
        .MENU_DELETED,

      (
        payload
      ) => {

        useMenuStore
          .getState()
          .removeProduct(
            payload?.id
          );

      }

    )

  );

  return () => {

    unsubscribers.forEach(
      (
        unsubscribe
      ) => {

        unsubscribe();

      }
    );

  };

}

export default
  registerMenuRealtime;