import { create }
  from "zustand";

/**
 * =========================================================
 * RUNTIME STORE
 * =========================================================
 */

const useRuntimeStore =
  create((set) => ({

    /**
     * =====================================================
     * STATE
     * =====================================================
     */

    loading: false,

    error: null,

    config: {
      app: {
        name:
          "Cing Hu Tang",

        tagline:
          "Luxury Milk Tea",
      },

      maintenance: {
        enabled: false,
      },
    },

    /**
     * =====================================================
     * ACTIONS
     * =====================================================
     */

    setLoading:
      (loading) =>
        set({
          loading,
        }),

    setError:
      (error) =>
        set({
          error,
        }),

    setConfig:
      (config) =>
        set({
          config,
        }),

  }));

export default
  useRuntimeStore;