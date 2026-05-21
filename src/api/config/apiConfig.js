export const API_CONFIG = {

  BASE_URL:
    "http://localhost:5050",

  REQUEST_TIMEOUT:
    10000,

  MAX_RETRIES:
    3,

  RETRY_DELAY_MS:
    1200,

  STALE_CACHE_MS:
    15000,

};

export const API_ENDPOINTS = {

  PAYMENT: {

    CREATE_SESSION:
      "/api/payment/create-session",

    VERIFY:
      "/api/payment/verify",

    STATUS:
      "/api/payment/status",

  },

};

console.log(
  "API BASE URL:",
  API_CONFIG.BASE_URL
);