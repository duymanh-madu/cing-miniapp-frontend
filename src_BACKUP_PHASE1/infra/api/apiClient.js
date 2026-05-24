import axios from "axios";

import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

/**
 * =====================================================
 * API CLIENT
 * =====================================================
 * Environment governed.
 * Development keeps localhost via .env.development.
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
