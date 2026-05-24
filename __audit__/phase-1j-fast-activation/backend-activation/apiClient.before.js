import axios from "axios";

/**
 * =====================================================
 * API CLIENT
 * =====================================================
 */

const apiClient =
  axios.create({

    baseURL:
      "http://localhost:5050",

    timeout:
      15000,

    headers: {

      "Content-Type":
        "application/json",

    },

  });

/**
 * =====================================================
 * REQUEST LOGGER
 * =====================================================
 */

apiClient.interceptors.request.use(
  (config) => {

    console.log(
      "API REQUEST:",
      `${config.baseURL}${config.url}`
    );

    return config;

  }
);

/**
 * =====================================================
 * RESPONSE LOGGER
 * =====================================================
 */

apiClient.interceptors.response.use(

  (response) => {

    console.log(
      "API RESPONSE:",
      response.data
    );

    return response;

  },

  (error) => {

    console.error(
      "API ERROR:",
      error.response?.data ||
      error.message
    );

    return Promise.reject(
      error
    );

  }

);

export default apiClient;