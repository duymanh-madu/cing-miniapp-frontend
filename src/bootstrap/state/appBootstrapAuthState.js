import { create } from "zustand";

/**
 * Initial backend-auth resolution authority.
 *
 * This is deliberately separate from useAuthStore:
 * - authenticated = current authentication state
 * - initialAuthResolved = whether cold-start auth has reached a
 *   definitive authenticated/unauthenticated result
 *
 * It is lifecycle state, not session state, so logout must not reset it.
 */
const useAppBootstrapAuthState = create((set) => ({
  initialAuthResolved: false,

  markInitialAuthResolved: () =>
    set({
      initialAuthResolved: true,
    }),
}));

export default useAppBootstrapAuthState;
