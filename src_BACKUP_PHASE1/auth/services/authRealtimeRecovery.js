import realtimeSocket from "@/realtime/socket";

export function recoverRealtimeAuth() {

  realtimeSocket.connect();

}