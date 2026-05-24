import {

  getRuntimeSocket,

  registerSocketListener,

} from "@/runtime/socket/runtimeSocketClient";

import useRealtimeCustomerStore
  from "@/stores/customer";

/**
 * =====================================================
 * CUSTOMER REALTIME BRIDGE
 * =====================================================
 */

let initialized =
  false;

const unsubscribers =
  [];

export function initializeCustomerRealtimeBridge() {

  if (
    initialized
  ) {

    return;

  }

  const socket =
    getRuntimeSocket();

  if (
    !socket
  ) {

    return;

  }

  unsubscribers.push(

    registerSocketListener(

      "customer:points_updated",

      (
        payload
      ) => {

        useRealtimeCustomerStore
          .getState()
          .setPoints(
            payload.points
          );

        console.log(
          "points updated",
          payload
        );

      }

    )

  );

  unsubscribers.push(

    registerSocketListener(

      "customer:tier_updated",

      (
        payload
      ) => {

        useRealtimeCustomerStore
          .getState()
          .setTier(
            payload.tier
          );

        console.log(
          "tier updated",
          payload
        );

      }

    )

  );

  unsubscribers.push(

    registerSocketListener(

      "voucher:new_voucher",

      (
        payload
      ) => {

        const current =
          useRealtimeCustomerStore
            .getState()
            .vouchers;

        useRealtimeCustomerStore
          .getState()
          .setVouchers([
            payload,
            ...current,
          ]);

        console.log(
          "new voucher",
          payload
        );

      }

    )

  );

  initialized =
    true;

}

export function destroyCustomerRealtimeBridge() {

  unsubscribers.forEach(
    (
      unsubscribe
    ) => {

      unsubscribe();

    }
  );

  unsubscribers.length =
    0;

  initialized =
    false;

}
