import { create } from "zustand";

/**
 * =====================================================
 * TYPES
 * =====================================================
 */

interface RuntimeCommerceState {

  active_orders:
    any[];

  pending_payments:
    any[];

  loyalty_points:
    number;

  setActiveOrders: (
    orders: any[]
  ) => void;

  setPendingPayments: (
    payments: any[]
  ) => void;

  setLoyaltyPoints: (
    points: number
  ) => void;

}

/**
 * =====================================================
 * STORE
 * =====================================================
 */

export const useRuntimeCommerceStore =
  create<
    RuntimeCommerceState
  >(

    (
      set
    ) => ({

      active_orders:
        [],

      pending_payments:
        [],

      loyalty_points:
        0,

      setActiveOrders: (
        orders
      ) =>

        set({

          active_orders:
            orders,

        }),

      setPendingPayments: (
        payments
      ) =>

        set({

          pending_payments:
            payments,

        }),

      setLoyaltyPoints: (
        points
      ) =>

        set({

          loyalty_points:
            points,

        }),

    })

  );