import { create }
  from "zustand";

export const useAnalyticsStore =
  create((set) => ({

    sessionId: null,

    queuedEvents: [],

    setSessionId(id) {

      set({

        sessionId: id,

      });

    },

    queueEvent(event) {

      set((state) => ({

        queuedEvents: [

          ...state.queuedEvents,

          event,

        ].slice(-50),

      }));

    },

    clearQueue() {

      set({

        queuedEvents: [],

      });

    },

  }));