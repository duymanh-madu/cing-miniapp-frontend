import realtimeSocket from "../socket";

export function initializeHeartbeat() {

  setInterval(() => {

    if (

      realtimeSocket.connected

    ) {

      realtimeSocket.emit(
        "heartbeat"
      );

    }

  }, 25000);

}