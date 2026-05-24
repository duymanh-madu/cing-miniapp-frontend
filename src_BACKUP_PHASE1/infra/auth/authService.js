import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import apiClient from "@/infra/api/apiClient";

import {
  resolveHttpError,
} from "@/api/errors/httpErrorHandler";

/**
 * =========================================================
 * NORMALIZE AUTH RESPONSE
 * =========================================================
 */

function normalizeAuthResponse(
  response = {}
) {

  return {

    accessToken:

      response.access_token ||

      response.accessToken ||

      "",

    refreshToken:

      response.refresh_token ||

      response.refreshToken ||

      "",

    expiresAt:

      response.expires_at ||

      response.expiresAt ||

      null,

    user:

      response.user ||

      null,

    metadata:
      response,

  };

}

/**
 * =========================================================
 * NORMALIZE PROFILE
 * =========================================================
 */

function normalizeProfile(
  profile = {}
) {

  return {

    id:

      profile.id ||

      profile.user_id ||

      "",

    name:

      profile.name ||

      profile.full_name ||

      "",

    phone:

      profile.phone ||

      "",

    avatar:

      profile.avatar ||

      "",

    role:

      profile.role ||

      "member",

    metadata:
      profile,

  };

}

/**
 * =========================================================
 * LOGIN
 * =========================================================
 */

export async function
login({

  phone,
  password,

}) {

  /**
   * =======================================================
   * VALIDATE
   * =======================================================
   */

  if (
    !phone ||
    !password
  ) {

    throw {

      message:
        "Thiếu thông tin đăng nhập",

      status:
        400,

    };

  }

  try {

    runtimeLogger.info("AUTH", 
      "🔐 LOGIN START",
      {
        phone,
      }
    );

    /**
     * =====================================================
     * REQUEST
     * =====================================================
     */

    const response =
      await apiClient.post(

        "/auth/login",

        {

          phone,
          password,

        }

      );

    /**
     * =====================================================
     * NORMALIZE
     * =====================================================
     */

    const auth =
      normalizeAuthResponse(

        response.data

      );

    runtimeLogger.info("AUTH", 
      "🟢 LOGIN SUCCESS",
      {
        userId:
          auth.user?.id,
      }
    );

    /**
     * =====================================================
     * RETURN
     * =====================================================
     */

    return auth;

  } catch (error) {

    /**
     * =====================================================
     * NORMALIZE ERROR
     * =====================================================
     */

    const parsedError =
      resolveHttpError(
        error
      );

    runtimeLogger.error("AUTH", 
      "❌ LOGIN FAILED",
      parsedError
    );

    throw parsedError;

  }

}

/**
 * =========================================================
 * REFRESH TOKEN
 * =========================================================
 */

export async function
refreshToken(
  refreshToken
) {

  /**
   * =======================================================
   * VALIDATE
   * =======================================================
   */

  if (
    !refreshToken
  ) {

    throw {

      message:
        "Missing refresh token",

      status:
        400,

    };

  }

  try {

    runtimeLogger.info("AUTH", 
      "🔄 REFRESH TOKEN"
    );

    /**
     * =====================================================
     * REQUEST
     * =====================================================
     */

    const response =
      await apiClient.post(

        "/auth/refresh",

        {

          refresh_token:
            refreshToken,

        }

      );

    /**
     * =====================================================
     * NORMALIZE
     * =====================================================
     */

    const auth =
      normalizeAuthResponse(

        response.data

      );

    runtimeLogger.info("AUTH", 
      "🟢 TOKEN REFRESHED"
    );

    /**
     * =====================================================
     * RETURN
     * =====================================================
     */

    return auth;

  } catch (error) {

    /**
     * =====================================================
     * NORMALIZE ERROR
     * =====================================================
     */

    const parsedError =
      resolveHttpError(
        error
      );

    runtimeLogger.error("AUTH", 
      "❌ REFRESH TOKEN FAILED",
      parsedError
    );

    throw parsedError;

  }

}

/**
 * =========================================================
 * GET PROFILE
 * =========================================================
 */

export async function
getProfile() {

  try {

    runtimeLogger.info("AUTH", 
      "👤 FETCH PROFILE"
    );

    /**
     * =====================================================
     * REQUEST
     * =====================================================
     */

    const response =
      await apiClient.get(
        "/auth/profile"
      );

    /**
     * =====================================================
     * NORMALIZE
     * =====================================================
     */

    const profile =
      normalizeProfile(

        response.data?.data ||

        response.data

      );

    runtimeLogger.info("AUTH", 
      "🟢 PROFILE READY",
      {
        userId:
          profile.id,
      }
    );

    /**
     * =====================================================
     * RETURN
     * =====================================================
     */

    return profile;

  } catch (error) {

    /**
     * =====================================================
     * NORMALIZE ERROR
     * =====================================================
     */

    const parsedError =
      resolveHttpError(
        error
      );

    runtimeLogger.error("AUTH", 
      "❌ FETCH PROFILE FAILED",
      parsedError
    );

    throw parsedError;

  }

}