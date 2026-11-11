import {recoverBackendAuthSession} from "@/infra/auth/authRecovery.js";
import { io } from "socket.io-client";
import { getAccessToken } from "../../../infra/auth/authStorage.js";
import { createPlazaRealtimeClientV1 } from "./plazaRealtimeClientV1.js";

export function createDefaultPlazaClientV1() {
  return createPlazaRealtimeClientV1({
    url: import.meta.env.VITE_GAME_SERVER_URL,
    ioFactory: io,
    timeoutMs:15000,
    recoverToken:async()=>{const session=await recoverBackendAuthSession();return session.accessToken;},
    getToken: getAccessToken,
  });
}
