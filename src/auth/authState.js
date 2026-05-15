import {
  create,
} from "zustand";

const useAuthStore =
  create((set) => ({

    authenticated:
      false,

    profile:
      null,

    loading:
      false,

    setAuthenticated:
      (
        authenticated
      ) =>
        set({
          authenticated,
        }),

    setProfile:
      (profile) =>
        set({
          profile,
        }),

    setLoading:
      (loading) =>
        set({
          loading,
        }),

    resetAuth:
      () =>
        set({

          authenticated:
            false,

          profile:
            null,

          loading:
            false,

        }),

  }));

export default
  useAuthStore;