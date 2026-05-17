import { create }
  from "zustand";

export const useAdminStore =
  create((set) => ({

    activityLogs: [],

    campaigns: [],

    realtimeAlerts: [],

    pushActivityLog(log) {

      set((state) => ({

        activityLogs: [

          log,

          ...state.activityLogs,

        ].slice(0, 100),

      }));

    },

    setCampaigns(campaigns) {

      set({

        campaigns,

      });

    },

    pushRealtimeAlert(alert) {

      set((state) => ({

        realtimeAlerts: [

          alert,

          ...state.realtimeAlerts,

        ].slice(0, 30),

      }));

    },

  }));