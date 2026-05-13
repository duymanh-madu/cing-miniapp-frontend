import apiClient from "../http/apiClient";

/**
 * ============================================
 * LOGIN
 * ============================================
 */

export async function login({
  phone,

  password,
}) {
  const response =
    await apiClient.post(
      "/auth/login",
      {
        phone,

        password,
      }
    );

  return response.data;
}

/**
 * ============================================
 * REFRESH TOKEN
 * ============================================
 */

export async function refreshToken(
  refreshToken
) {
  const response =
    await apiClient.post(
      "/auth/refresh",
      {
        refresh_token:
          refreshToken,
      }
    );

  return response.data;
}

/**
 * ============================================
 * GET PROFILE
 * ============================================
 */

export async function getProfile() {
  const response =
    await apiClient.get(
      "/auth/profile"
    );

  return response.data;
}