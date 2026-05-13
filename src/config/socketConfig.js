import {
  SOCKET_URL,
} from "@/config/appConfig";

/**
 * =========================================================
 * SOCKET CONFIG
 * =========================================================
 */

const socketConfig = {

  url:
    SOCKET_URL,

  options: {

    transports: [
      "websocket",
    ],

    reconnection:
      true,

    reconnectionDelay:
      1500,

    timeout:
      10000,

  },

};

export default
  socketConfig;