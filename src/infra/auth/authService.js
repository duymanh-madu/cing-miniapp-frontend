import httpClient from "@/services/http/httpClient";

import {
  resolveHttpError,
} from "@/services/http/httpErrorHandler";

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

    console.log(
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
      await httpClient.post(

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

    console.log(
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

    console.error(
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

    console.log(
      "🔄 REFRESH TOKEN"
    );

    /**
     * =====================================================
     * REQUEST
     * =====================================================
     */

    const response =
      await httpClient.post(

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

    console.log(
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

    console.error(
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

    console.log(
      "👤 FETCH PROFILE"
    );

    /**
     * =====================================================
     * REQUEST
     * =====================================================
     */

    const response =
      await httpClient.get(
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

    console.log(
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

    console.error(
      "❌ FETCH PROFILE FAILED",
      parsedError
    );

    throw parsedError;

  }

}