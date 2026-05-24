import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {

  getRealtimeChannels,
} from "./runtimeRealtimeChannels";

export function initializeRealtimeChannels() {

  const channels =
    getRealtimeChannels();

  runtimeLogger.info("RUNTIME", 
    "[REALTIME] Registering channels",
    channels
  );

  return channels;

}