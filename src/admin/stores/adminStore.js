import {
  create,
} from "zustand";

/**
 * ============================================
 * ADMIN STORE
 * ============================================
 */

const useAdminStore =
  create((set) => ({
    /**
     * DASHBOARD
     */

    dashboardReady:
      false,

    /**
     * REALTIME
     */

    liveMode: true,

    /**
     * OPERATIONS
     */

    activeModule:
      "dashboard",

    /**
     * ACTIONS
     */

    setDashboardReady:
      (value) =>
        set({
          dashboardReady:
            value,
        }),

    setLiveMode:
      (value) =>
        set({
          liveMode:
            value,
        }),

    setActiveModule:
      (value) =>
        set({
          activeModule:
            value,
        }),
  }));

export default useAdminStore;