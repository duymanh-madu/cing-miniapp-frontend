import { io }
  from "socket.io-client";

/**
 * =========================================================
 * SOCKET URL
 * =========================================================
 */

const SOCKET_URL =
  import.meta.env
    .VITE_SOCKET_URL ||
  "http://localhost:5050";

/**
 * =========================================================
 * SOCKET INSTANCE
 * =========================================================
 */

const socket = io(
  SOCKET_URL,
  {
    autoConnect:
      false,

    transports: [
      "websocket",
      "polling",
    ],

    reconnection:
      true,

    reconnectionAttempts:
      Infinity,

    reconnectionDelay:
      1000,

    reconnectionDelayMax:
      5000,

    timeout:
      20000,

    withCredentials:
      true,
  }
);

/**
 * =========================================================
 * DEBUG
 * =========================================================
 */

socket.on(
  "connect",
  () => {
    console.log(
      "🟢 SOCKET CONNECTED:",
      socket.id
    );
  }
);

socket.on(
  "disconnect",
  (reason) => {
    console.log(
      "🔴 SOCKET DISCONNECTED:",
      reason
    );
  }
);

socket.on(
  "connect_error",
  (error) => {
    console.error(
      "❌ SOCKET ERROR:",
      error.message
    );
  }
);

export default socket;