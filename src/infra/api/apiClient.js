import axios from "axios";

import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {
  getAccessToken,
} from "@/infra/auth/authStorage";

/**
 * =====================================================
 * API CLIENT
 * =====================================================
 * Environment governed.
 * Development uses local environment values via ignored .env files.
 * Production must use VITE_API_BASE_URL.
 * =====================================================
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "/api";

const apiClient =
  axios.create({

    baseURL:
      API_BASE_URL,

    timeout:
      15000,

    headers: {

      "Content-Type":
        "application/json",

    },

  });

apiClient.interceptors.request.use(
  (config) => {

    const accessToken =
      getAccessToken();

    if (accessToken) {
      const headers =
        config.headers || {};

      const hasExplicitAuthorization =
        typeof headers.get === "function"
          ? Boolean(
              headers.get(
                "Authorization"
              )
            )
          : Boolean(
              headers.Authorization ||
              headers.authorization
            );

      if (!hasExplicitAuthorization) {
        if (
          typeof headers.set ===
          "function"
        ) {
          headers.set(
            "Authorization",
            `Bearer ${accessToken}`
          );
        } else {
          headers.Authorization =
            `Bearer ${accessToken}`;
        }

        config.headers =
          headers;
      }
    }

    runtimeLogger.info(
      "API",
      "REQUEST",
      {
        method:
          config.method,
        url:
          config.url,
        baseURL:
          config.baseURL,
      }
    );

    return config;

  }
);

apiClient.interceptors.response.use(

  (response) => {

    runtimeLogger.info(
      "API",
      "RESPONSE",
      {
        url:
          response.config?.url,
        status:
          response.status,
      }
    );

    return response;

  },

  (error) => {

    runtimeLogger.error(
      "API",
      "ERROR",
      {
        url:
          error.config?.url,
        status:
          error.response?.status,
        message:
          error.response?.data ||
          error.message,
      }
    );

    return Promise.reject(
      error
    );

  }

);

export default apiClient;
