import {
  create,
} from "zustand";

const defaultState = {
  paymentStatus:
    "idle",

  transactionId:
    null,

  paymentSessionId:
    null,

  paymentProvider:
    null,

  paymentError:
    null,

  recoveryPending:
    false,

  retryCount:
    0,

  lastUpdatedAt:
    null,
};

export const usePaymentStore =
  create((set) => ({

    ...defaultState,

    setPaymentStatus(status) {

      set({
        paymentStatus:
          status,
        lastUpdatedAt:
          new Date().toISOString(),
      });

    },

    setPaymentSession(payload = {}) {

      set({
        transactionId:
          payload.transactionId ||
          payload.transaction_id ||
          null,

        paymentSessionId:
          payload.paymentSessionId ||
          payload.sessionId ||
          payload.session_id ||
          null,

        paymentProvider:
          payload.paymentProvider ||
          payload.provider ||
          null,

        paymentStatus:
          payload.status ||
          "pending",

        paymentError:
          null,

        recoveryPending:
          false,

        lastUpdatedAt:
          new Date().toISOString(),
      });

    },

    setPaymentError(error) {

      set({
        paymentError:
          error?.message ||
          error ||
          "payment_error",

        paymentStatus:
          "failed",

        lastUpdatedAt:
          new Date().toISOString(),
      });

    },

    setRecoveryPending(value) {

      set({
        recoveryPending:
          Boolean(value),

        lastUpdatedAt:
          new Date().toISOString(),
      });

    },

    incrementRetry() {

      set((state) => ({
        retryCount:
          state.retryCount + 1,
        lastUpdatedAt:
          new Date().toISOString(),
      }));

    },

    resetPayment() {

      set({
        ...defaultState,
      });

    },

  }));
