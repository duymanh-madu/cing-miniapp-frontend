import realtimeSocket from "../socket";

export function cleanupRealtimeListeners() {

  realtimeSocket.removeAllListeners();

}