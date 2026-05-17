import realtimeSocket from "../socket";

export function initializeVisibilityRecovery() {

  function recover() {

    if (

      document.visibilityState ===
      "visible"

    ) {

      realtimeSocket.connect();

    }

  }

  document.addEventListener(
    "visibilitychange",
    recover
  );

}