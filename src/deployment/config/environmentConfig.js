export const ENVIRONMENT_CONFIG = {

  APP_ENV:

    import.meta.env.MODE,

  API_URL:

    import.meta.env
      .VITE_API_URL,

  SOCKET_URL:

    import.meta.env
      .VITE_SOCKET_URL,

  ENABLE_DEBUG:

    import.meta.env
      .VITE_ENABLE_DEBUG ===
    "true",

};