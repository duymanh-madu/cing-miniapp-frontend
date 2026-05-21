import { create } from "zustand";

/**
 * =====================================================
 * TYPES
 * =====================================================
 */

interface RuntimeDeliveryState {

  order_id:
    string | null;

  delivery_status:
    string | null;

  eta_minutes:
    number | null;

  shipper_name:
    string | null;

  setDeliveryState: (

    payload: Partial<
      RuntimeDeliveryState
    >

  ) => void;

}

/**
 * =====================================================
 * STORE
 * =====================================================
 */

export const useRuntimeDeliveryStore =
  create<
    RuntimeDeliveryState
  >(

    (
      set
    ) => ({

      order_id:
        null,

      delivery_status:
        null,

      eta_minutes:
        null,

      shipper_name:
        null,

      setDeliveryState:
        (
          payload
        ) =>

          set(
            payload
          ),

    })

  );