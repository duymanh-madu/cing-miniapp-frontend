import {
  useEffect,
} from "react";

import realtimeSocket from "@/realtime/socket";

export function useZaloVisibilityRecovery() {

  useEffect(() => {

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

    return () => {

      document.removeEventListener(

        "visibilitychange",

        recover

      );

    };

  }, []);

}