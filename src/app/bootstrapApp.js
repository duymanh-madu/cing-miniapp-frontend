import {
  bootstrapRealtime,
} from "@/realtime/bootstrapRealtime";

import {
  registerQueryRealtimeSync,
} from "@/query";

import {
  bootstrapAuth,
} from "@/auth/bootstrapAuth";

let initialized =
  false;

let cleanupRealtime =
  null;

let cleanupQuerySync =
  null;

export function bootstrapApp() {

  if (
    initialized
  ) {

    return cleanup;

  }

  initialized =
    true;

  cleanupRealtime =
    bootstrapRealtime();

  cleanupQuerySync =
    registerQueryRealtimeSync();

  bootstrapAuth();

  console.log(
    "🟢 APP BOOTSTRAPPED"
  );

  return cleanup;

}

function cleanup() {

  cleanupRealtime?.();

  cleanupQuerySync?.();

  initialized =
    false;

  console.log(
    "🔴 APP DESTROYED"
  );

}