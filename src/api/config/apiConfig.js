export const API_CONFIG = {

  BASE_URL:

    import.meta.env
      .VITE_API_URL,

  REQUEST_TIMEOUT:
    10000,

  MAX_RETRIES:
    3,

  RETRY_DELAY_MS:
    1200,

  STALE_CACHE_MS:
    15000,

};