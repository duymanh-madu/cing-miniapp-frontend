/**
 * =====================================================
 * AUTH SERVICE
 * =====================================================
 * Production governance:
 * - Authentication is delegated to Zalo identity runtime
 *   and backend session verification.
 * - Frontend must never seed fake guest users.
 * - Guest activation is handled through runtime activation flow.
 * =====================================================
 */

export async function loginGuest() {

  return {

    success: false,

    requiresActivation:
      true,

    token:
      null,

    user:
      null,

  };

}
