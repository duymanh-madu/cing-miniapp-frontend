import useAuthStore from "./authState";

export function useAuthSession() {

  return useAuthStore(
    (state) => ({

      authenticated:
        state.authenticated,

      profile:
        state.profile,

      loading:
        state.loading,

    })
  );

}