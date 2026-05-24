import realtimeSocket from "@/realtime/socket";

export function initializeMobileRecovery() {

  window.addEventListener(
    "online",
    () => {

      realtimeSocket.connect();

    }
  );

  window.addEventListener(
    "offline",
    () => {

      realtimeSocket.disconnect();

    }
  );

}