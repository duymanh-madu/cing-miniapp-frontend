import useAuthStore from "@/stores/authStore";

export function useAuthenticated() {

  return useAuthStore(
    (
      state
    ) => state.authenticated
  );

}