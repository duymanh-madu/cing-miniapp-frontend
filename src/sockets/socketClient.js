import { io } from "socket.io-client";

import {
  SOCKET_CONFIG,
} from "@/config/appConfig";

const socketClient = io(
  SOCKET_CONFIG.url,
  {
    path:
      SOCKET_CONFIG.path ||
      "/socket.io",

    transports: [
      "websocket",
      "polling",
    ],

    autoConnect:
      false,

    withCredentials:
      true,

    reconnection:
      true,

    reconnectionAttempts:
      Infinity,

    reconnectionDelay:
      1000,

    reconnectionDelayMax:
      10000,

    timeout:
      20000,
  }
);

export default socketClient;