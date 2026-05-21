import socket from "@/services/socket/socketClient";

import useRealtimeCustomerStore
  from "@/stores/realtimeCustomerStore";

/**
 * =====================================================
 * CUSTOMER REALTIME BRIDGE
 * =====================================================
 */

export function initializeCustomerRealtimeBridge() {

  /**
   * ============================================
   * POINTS UPDATED
   * ============================================
   */

  socket.on(
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
  );

  /**
   * ============================================
   * TIER UPDATED
   * ============================================
   */

  socket.on(
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
  );

  /**
   * ============================================
   * NEW VOUCHER
   * ============================================
   */

  socket.on(
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
  );

}