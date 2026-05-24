import { create } from "zustand";

export const useRealtimeRenderState =
  create((set) => ({

    renderLocked: false,

    setRenderLocked(value) {

      set({

        renderLocked: value,

      });

    },

  }));