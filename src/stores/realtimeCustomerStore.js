import {
  create,
} from "zustand";

const realtimeCustomerStore =
  create((set) => ({

    profile:
      null,

    points:
      0,

    tier:
      null,

    vouchers:
      [],

    wallet:
      null,

    spending:
      0,

    rank:
      null,

    setProfile:
      (profile) =>
        set({
          profile,
        }),

    setPoints:
      (points) =>
        set({
          points,
        }),

    setTier:
      (tier) =>
        set({
          tier,
        }),

    setVouchers:
      (vouchers) =>
        set({
          vouchers,
        }),

    setWallet:
      (wallet) =>
        set({
          wallet,
        }),

    setSpending:
      (spending) =>
        set({
          spending,
        }),

    setRank:
      (rank) =>
        set({
          rank,
        }),

  }));

export default
  realtimeCustomerStore;