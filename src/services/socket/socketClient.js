import {
  io,
} from "socket.io-client";

/**
 * =====================================================
 * SOCKET URL
 * =====================================================
 */

const SOCKET_URL =
  import.meta.env
    .VITE_SOCKET_URL;

/**
 * =====================================================
 * SOCKET CLIENT
 * =====================================================
 */

const socket =
  io(
    SOCKET_URL,
    {

      transports: [
        "websocket",
      ],

      autoConnect:
        true,

      reconnection:
        true,

      reconnectionAttempts:
        10,

      reconnectionDelay:
        2000,

      timeout:
        20000,

      withCredentials:
        true,

    }
  );

/**
 * =====================================================
 * EXPORT
 * =====================================================
 */

export default socket;