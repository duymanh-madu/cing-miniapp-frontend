import {
  getRealtimeChannels,
} from "./runtimeRealtimeChannels";

export function initializeRealtimeChannels() {

  const channels =
    getRealtimeChannels();

  console.log(
    "[REALTIME] Registering channels",
    channels
  );

  return channels;

}