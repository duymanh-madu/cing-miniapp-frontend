import {
  usePaymentStore,
} from "../store/paymentStore";

import {
  PAYMENT_REALTIME_EVENTS,
} from "../constants/paymentRealtimeEvents";

import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

/**
 * =====================================================
 * PAYMENT REALTIME BRIDGE
 * =====================================================
 * Governed realtime payment synchronization.
 * Syncs:
 * - status
 * - transaction id
 * - session id
 * - provider
 * - payment errors
 * - recovery state
 * =====================================================
 */

export function connectPaymentRealtime({
  socket,
}) {

  if (!socket?.on) {

    runtimeLogger.warn(
      "PAYMENT",
      "[REALTIME] Socket unavailable"
    );

    return () => {};

  }

  const unsubscribe =
    socket.on(
      PAYMENT_REALTIME_EVENTS.UPDATED,
      (payload = {}) => {

        const store =
          usePaymentStore.getState();

        store.setPaymentSession({

          transactionId:
            payload.transactionId ||
            payload.transaction_id,

          paymentSessionId:
            payload.paymentSessionId ||
            payload.sessionId ||
            payload.session_id,

          paymentProvider:
            payload.paymentProvider ||
            payload.provider,

          status:
            payload.status ||
            "unknown",

        });

        if (
          payload.status ===
          "failed"
        ) {

          store.setPaymentError(
            payload.error ||
            payload.message ||
            "payment_failed"
          );

        }

        if (
          payload.status ===
            "paid" ||

          payload.status ===
            "completed"
        ) {

          store.setRecoveryPending(
            false
          );

        }

        runtimeLogger.info(
          "PAYMENT",
          "[REALTIME] PAYMENT UPDATED",
          {
            transactionId:
              payload.transactionId,

            status:
              payload.status,
          }
        );

      }
    );

  runtimeLogger.info(
    "PAYMENT",
    "[REALTIME] Payment listener connected"
  );

  return typeof unsubscribe === "function"
    ? unsubscribe
    : () => {

      socket.off?.(
        PAYMENT_REALTIME_EVENTS.UPDATED
      );

    };

}
