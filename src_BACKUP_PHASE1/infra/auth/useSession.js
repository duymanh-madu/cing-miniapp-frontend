import useAuthStore from "@/stores/auth";

export function useSession() {

  return useAuthStore(
    (
      state
    ) => ({

      authenticated:
        state.authenticated,

      profile:
        state.profile,

      accessToken:
        state.accessToken,

      refreshToken:
        state.refreshToken,

    })
  );

}