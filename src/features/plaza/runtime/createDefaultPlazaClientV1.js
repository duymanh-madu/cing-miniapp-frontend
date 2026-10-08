import { io } from "socket.io-client";
import { getAccessToken } from "../../../infra/auth/authStorage.js";
import { createPlazaRealtimeClientV1 } from "./plazaRealtimeClientV1.js";

export function createDefaultPlazaClientV1() {
  return createPlazaRealtimeClientV1({
    url: import.meta.env.VITE_GAME_SERVER_URL,
    ioFactory: io,
    getToken: getAccessToken,
  });
}
