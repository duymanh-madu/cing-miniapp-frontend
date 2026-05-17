import { create }
  from "zustand";

import {

  createRealtimeSlice,

} from "../slices/realtimeSlice";

import {

  createCustomerSlice,

} from "../slices/customerSlice";

import {

  createOrderSlice,

} from "../slices/orderSlice";

import {

  createRewardSlice,

} from "../slices/rewardSlice";

export const useAppStore =
  create((...a) => ({

    ...createRealtimeSlice(
      ...a
    ),

    ...createCustomerSlice(
      ...a
    ),

    ...createOrderSlice(
      ...a
    ),

    ...createRewardSlice(
      ...a
    ),

  }));