import { create } from "zustand";

export const useDashboardRealtimeStore =
  create((set) => ({

    activityFeed: [],

    leaderboard: [],

    liveRevenue: 0,

    onlineCustomers: 0,

    activeOrders: [],

    pushActivity(activity) {

      set((state) => ({

        activityFeed: [

          activity,

          ...state.activityFeed,

        ].slice(0, 30),

      }));

    },

    updateLeaderboard(data) {

      set({

        leaderboard: data,

      });

    },

    updateRevenue(amount) {

      set({

        liveRevenue: amount,

      });

    },

    updatePresence(count) {

      set({

        onlineCustomers: count,

      });

    },

    updateOrders(orders) {

      set({

        activeOrders: orders,

      });

    },

  }));