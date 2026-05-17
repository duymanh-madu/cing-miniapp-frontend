import { create } from "zustand";

export const useCustomerUXStore =
  create((set) => ({

    loading: false,

    reconnecting: false,

    recentRewards: [],

    recentOrders: [],

    setLoading(value) {

      set({

        loading: value,

      });

    },

    setReconnecting(value) {

      set({

        reconnecting: value,

      });

    },

    pushReward(reward) {

      set((state) => ({

        recentRewards: [

          reward,

          ...state.recentRewards,

        ].slice(0, 10),

      }));

    },

    pushOrder(order) {

      set((state) => ({

        recentOrders: [

          order,

          ...state.recentOrders,

        ].slice(0, 10),

      }));

    },

  }));