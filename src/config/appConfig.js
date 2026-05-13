/**
 * =========================================================
 * ENVIRONMENT
 * =========================================================
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5050";

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "http://localhost:5050";

/**
 * =========================================================
 * API
 * =========================================================
 */

export const API_CONFIG = {

  baseURL:
    API_BASE_URL,

  timeout:
    15000,

};

/**
 * =========================================================
 * SOCKET
 * =========================================================
 */

export const SOCKET_CONFIG = {

  url:
    SOCKET_URL,

  transports: [
    "websocket",
  ],

  reconnection:
    true,

};