import { create }
  from "zustand";

import {

  createRealtimeSlice,

} from "./slices/realtimeSlice";

import {

  createCustomerSlice,

} from "./slices/customerSlice";

import {

  createOrderSlice,

} from "./slices/orderSlice";

import {

  createRewardSlice,

} from "./slices/rewardSlice";

/**
 * =====================================================
 * APPLICATION ROOT STORE
 * =====================================================
 */

export const useAppStore =
  create(

    (
      ...args
    ) => ({

      ...createRealtimeSlice(
        ...args
      ),

      ...createCustomerSlice(
        ...args
      ),

      ...createOrderSlice(
        ...args
      ),

      ...createRewardSlice(
        ...args
      ),

    })

  );

export default
  useAppStore;