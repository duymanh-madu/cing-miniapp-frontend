import axios from "axios";

/**
 * =========================================================
 * API BASE URL
 * =========================================================
 */

const API_BASE_URL =

  import.meta.env
    .VITE_API_BASE_URL ||

  "http://localhost:5050";

/**
 * =========================================================
 * AXIOS INSTANCE
 * =========================================================
 */

const httpClient =
  axios.create({

    baseURL:
      API_BASE_URL,

    timeout:
      10000,

    headers: {

      "Content-Type":
        "application/json",

    },

  });

/**
 * =========================================================
 * REQUEST INTERCEPTOR
 * =========================================================
 */

httpClient.interceptors.request.use(

  (config) => {

    /**
     * =====================================================
     * FUTURE AUTH
     * =====================================================
     */

    return config;

  },

  (error) => {

    return Promise.reject(
      error
    );

  }

);

/**
 * =========================================================
 * RESPONSE INTERCEPTOR
 * =========================================================
 */

httpClient.interceptors.response.use(

  (response) => {

    return response;

  },

  (error) => {

    /**
     * =====================================================
     * NORMALIZE ERROR
     * =====================================================
     */

    const normalizedError = {

      message:

        error?.response
          ?.data
          ?.message ||

        error?.message ||

        "Unknown API Error",

      status:
        error?.response
          ?.status ||

        500,

      data:
        error?.response
          ?.data ||

        null,

    };

    return Promise.reject(
      normalizedError
    );

  }

);

export default
  httpClient;