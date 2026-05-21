import { create } from "zustand";

interface CustomerRuntimeState {

  customerId: string | null;

  customerName: string;

  memberTier: string;

  loyaltyPoints: number;

  setCustomer: (
    payload: {

      customerId: string | null;

      customerName: string;

      memberTier: string;

      loyaltyPoints: number;

    }
  ) => void;

}

export const useCustomerRuntimeStore =
  create<CustomerRuntimeState>(

    (
      set
    ) => ({

      customerId: null,

      customerName: "",

      memberTier: "Hội viên",

      loyaltyPoints: 0,

      setCustomer: (
        payload
      ) => set({

        customerId:
          payload.customerId,

        customerName:
          payload.customerName,

        memberTier:
          payload.memberTier,

        loyaltyPoints:
          payload.loyaltyPoints,

      }),

    })

  );