import { create }
  from "zustand";

/**
 * =========================================================
 * CONFIG STORE
 * =========================================================
 */

const useConfigStore =
  create((set) => ({

    config:
      null,

    loading:
      false,

    error:
      null,

    setConfig:
      (config) => {

        set({
          config,
        });

      },

    setLoading:
      (loading) => {

        set({
          loading,
        });

      },

    setError:
      (error) => {

        set({
          error,
        });

      },

  }));

export default
  useConfigStore;