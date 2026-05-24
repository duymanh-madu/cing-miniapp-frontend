import useAuthStore from "@/stores/auth";

export function useAuthenticated() {

  return useAuthStore(
    (
      state
    ) => state.authenticated
  );

}