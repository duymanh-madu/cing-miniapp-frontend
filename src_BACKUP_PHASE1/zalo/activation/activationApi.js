import apiClient from "@/infra/api/apiClient";

/**
 * =====================================================
 * MINI APP ACTIVATION API
 * =====================================================
 * Backend owns:
 * - activation idempotency
 * - CRM/iPOS lookup
 * - normalized customer payload
 * =====================================================
 */

export async function activateMiniAppUser(payload) {

  const response =
    await apiClient.post(
      "/activation/bootstrap",
      payload
    );

  return response.data;

}
