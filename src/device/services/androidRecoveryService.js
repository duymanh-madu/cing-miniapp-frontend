import realtimeSocket from "@/realtime/socket";

export function recoverAndroidWebView() {

  if (

    navigator.onLine &&
    !realtimeSocket.connected

  ) {

    realtimeSocket.connect();

  }

}