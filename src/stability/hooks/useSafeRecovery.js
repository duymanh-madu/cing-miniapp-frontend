import {
  useEffect,
} from "react";

import realtimeSocket from "@/realtime/socket";

export function useSafeRecovery() {

  useEffect(() => {

    function recover() {

      if (

        navigator.onLine

      ) {

        realtimeSocket.connect();

      }

    }

    window.addEventListener(
      "online",
      recover
    );

    return () => {

      window.removeEventListener(
        "online",
        recover
      );

    };

  }, []);

}