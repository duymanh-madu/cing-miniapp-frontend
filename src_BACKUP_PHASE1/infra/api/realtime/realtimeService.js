import {

  getRuntimeSocket,

} from "@/runtime/socket/runtimeSocketClient";

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

  if (
    initialized
  ) {

    return;

  }

  const socket =
    getRuntimeSocket();

  if (
    !socket
  ) {

    return;

  }

  initialized =
    true;

  cleanupRealtime =
    registerRealtimeRouter({

      socket,

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
