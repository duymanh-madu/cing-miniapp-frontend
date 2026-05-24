import apiClient from "@/infra/api/apiClient";

import {
  usePaymentStore,
} from "../store/paymentStore";

import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

/**
 * =====================================================
 * PAYMENT RECOVERY SERVICE
 * =====================================================
 * Governed payment recovery flow:
 * - duplicate recovery prevention
 * - payment store synchronization
 * - recovery state management
 * - realtime-safe recovery lifecycle
 * =====================================================
 */

let activeRecoveryPromise =
  null;

export async function recoverPayment({
  transactionId,
}) {

  if (!transactionId) {

    runtimeLogger.warn(
      "PAYMENT",
      "[RECOVERY] Missing transactionId"
    );

    return null;

  }

  if (
    activeRecoveryPromise
  ) {

    runtimeLogger.info(
      "PAYMENT",
      "[RECOVERY] Reusing active recovery"
    );

    return activeRecoveryPromise;

  }

  const store =
    usePaymentStore.getState();

  store.setRecoveryPending(
    true
  );

  activeRecoveryPromise =
    (async () => {

      try {

        runtimeLogger.info(
          "PAYMENT",
          "[RECOVERY] Recovering payment",
          transactionId
        );

        const response =
          await apiClient.get(
            `/payments/recover/${transactionId}`
          );

        const paymentData =
          response?.data;

        if (
          paymentData?.success
        ) {

          store.setPaymentSession({

            transactionId:
              paymentData?.transactionId ||
              paymentData?.transaction_id,

            paymentSessionId:
              paymentData?.paymentSessionId ||
              paymentData?.sessionId ||
              paymentData?.session_id,

            paymentProvider:
              paymentData?.paymentProvider ||
              paymentData?.provider,

            status:
              paymentData?.status ||
              "pending",

          });

          runtimeLogger.info(
            "PAYMENT",
            "[RECOVERY] Payment recovered"
          );

        } else {

          store.setPaymentError(
            paymentData?.error ||
            paymentData?.message ||
            "payment_recovery_failed"
          );

        }

        return paymentData;

      } catch (error) {

        store.setPaymentError(
          error
        );

        runtimeLogger.error(
          "PAYMENT",
          "[RECOVERY] Recovery failed",
          error
        );

        throw error;

      } finally {

        store.setRecoveryPending(
          false
        );

        activeRecoveryPromise =
          null;

      }

    })();

  return activeRecoveryPromise;

}
