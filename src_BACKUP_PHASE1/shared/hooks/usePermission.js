import useAuthStore from "../stores/auth";

/**
 * ============================================
 * USE PERMISSION
 * ============================================
 */

function usePermission(
  permission
) {
  const permissions =
    useAuthStore(
      (state) =>
        state.permissions
    );

  return permissions.includes(
    permission
  );
}

export default usePermission;