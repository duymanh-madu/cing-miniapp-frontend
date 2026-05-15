import socketClient from "@/services/socket/socketClient";

import {
  queryClient,
} from "@/providers/QueryProvider";

import {
  registerRealtimeRouter,
} from "./realtimeEventRouter";

let cleanupRealtime =
  null;

let initialized =
  false;

export function initializeRealtimeService() {
  if (initialized) {
    return;
  }

  initialized = true;

  cleanupRealtime =
    registerRealtimeRouter({
      socket:
        socketClient,

      queryClient,
    });
}

export function destroyRealtimeService() {
  cleanupRealtime?.();

  cleanupRealtime =
    null;

  initialized =
    false;
}