import axios from "axios";

import useAuthStore from "../../stores/authStore";

import {
  clearSession,
} from "../auth/authStorage";

import {
  handleHttpError,
} from "./httpClientEvents";

/**
 * ============================================
 * API CLIENT
 * ============================================
 */

const apiClient =
  axios.create({
    baseURL:
      import.meta.env
        .VITE_API_URL,

    timeout: 15000,

    headers: {
      "Content-Type":
        "application/json",
    },
  });

/**
 * ============================================
 * REQUEST INTERCEPTOR
 * ============================================
 */

apiClient.interceptors.request.use(
  (config) => {
    const accessToken =
      useAuthStore
        .getState()
        .accessToken;

    /**
     * TOKEN
     */

    if (
      accessToken
    ) {
      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    /**
     * REQUEST START
     */

    config.metadata = {
      startTime:
        Date.now(),
    };

    return config;
  }
);

/**
 * ============================================
 * RESPONSE INTERCEPTOR
 * ============================================
 */

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    /**
     * UNAUTHORIZED
     */

    if (
      error?.response
        ?.status === 401
    ) {
      clearSession();

      useAuthStore
        .getState()
        .logout();
    }

    /**
     * ERROR PIPELINE
     */

    handleHttpError(
      error
    );

    return Promise.reject(
      error
    );
  }
);

export default apiClient;