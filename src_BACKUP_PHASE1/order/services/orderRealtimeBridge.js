import {
  useOrderExperienceStore,
} from "../stores/orderExperienceStore";

import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

/**
 * =====================================================
 * ORDER REALTIME BRIDGE
 * =====================================================
 * Governed realtime lifecycle:
 * - cleanup safe
 * - duplicate safe
 * - realtime governed
 * =====================================================
 */

export function connectOrderRealtime({
  socket,
}) {

  if (!socket?.on) {

    runtimeLogger.warn(
      "ORDER",
      "[REALTIME] Socket unavailable"
    );

    return () => {};

  }

  const unsubscribeActive =
    socket.on(
      "order.active",
      (payload) => {

        useOrderExperienceStore
          .getState()
          .setActiveOrder(
            payload
          );

      }
    );

  const unsubscribeHistory =
    socket.on(
      "order.history",
      (payload) => {

        useOrderExperienceStore
          .getState()
          .setOrderHistory(
            payload
          );

      }
    );

  const unsubscribePending =
    socket.on(
      "order.payment_pending",
      (payload) => {

        useOrderExperienceStore
          .getState()
          .setPaymentPending(
            payload?.pending
          );

      }
    );

  runtimeLogger.info(
    "ORDER",
    "[REALTIME] Order listeners connected"
  );

  return () => {

    unsubscribeActive?.();
    unsubscribeHistory?.();
    unsubscribePending?.();

  };

}
