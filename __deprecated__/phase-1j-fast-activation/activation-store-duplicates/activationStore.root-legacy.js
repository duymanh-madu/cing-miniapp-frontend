import { create } from "zustand";

const useActivationStore = create((set) => ({
  activated: false,

  loading: false,

  profile: null,

  accessToken: null,

  setLoading: (loading) =>
    set({
      loading,
    }),

  activate: (payload) =>
    set({
      activated: true,
      ...payload,
    }),

  logout: () =>
    set({
      activated: false,
      profile: null,
      accessToken: null,
    }),
}));

export default useActivationStore;