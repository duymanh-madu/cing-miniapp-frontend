import { useEffect } from "react";

import realtimeSocket from "@/realtime/socket";

export function useVisibilityRecovery() {

  useEffect(() => {

    function handleVisibility() {

      if (
        document.visibilityState ===
        "visible"
      ) {

        realtimeSocket.connect();

      }

    }

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

    };

  }, []);

}