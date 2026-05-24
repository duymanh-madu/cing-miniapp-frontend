import { create } from "zustand";

interface PaymentRuntimeState {

  paymentStatus:
    string | null;

  paymentProvider:
    string | null;

  paymentAmount:
    number;

  setPaymentState: (
    payload: {

      paymentStatus:
        string | null;

      paymentProvider:
        string | null;

      paymentAmount:
        number;

    }
  ) => void;

}

export const usePaymentRuntimeStore =
  create<PaymentRuntimeState>(

    (
      set
    ) => ({

      paymentStatus:
        null,

      paymentProvider:
        null,

      paymentAmount:
        0,

      setPaymentState: (
        payload
      ) => set({

        paymentStatus:
          payload.paymentStatus,

        paymentProvider:
          payload.paymentProvider,

        paymentAmount:
          payload.paymentAmount,

      }),

    })

  );