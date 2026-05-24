import useAuthStore from "@/stores/auth";

/**
 * =====================================================
 * AUTH STATE COMPATIBILITY BRIDGE
 * =====================================================
 * Source of truth:
 *   src/stores/auth/authStore.js
 *
 * This file exists only for legacy imports.
 * Do not create a second Zustand auth store here.
 * =====================================================
 */

export default useAuthStore;
