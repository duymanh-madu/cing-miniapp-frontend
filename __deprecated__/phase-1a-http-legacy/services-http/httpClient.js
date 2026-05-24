import axios from "axios";

/**
 * =====================================================
 * HTTP CLIENT
 * =====================================================
 */

const httpClient =
  axios.create({

    baseURL:
      import.meta.env
        .VITE_API_URL ||

      "http://localhost:3000",

    timeout:
      20000,

    withCredentials:
      true,

    headers: {

      "Content-Type":
        "application/json",

    },

  });

/**
 * =====================================================
 * REQUEST INTERCEPTOR
 * =====================================================
 */

httpClient.interceptors.request.use(

  (config) => {

    const token =
      localStorage.getItem(
        "access_token"
      );

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;

    }

    return config;

  }

);

/**
 * =====================================================
 * RESPONSE INTERCEPTOR
 * =====================================================
 */

httpClient.interceptors.response.use(

  (response) => {

    return response;

  },

  (error) => {

    console.error(
      "[HTTP ERROR]",
      error
    );

    return Promise.reject(
      error
    );

  }

);

export default
  httpClient;
