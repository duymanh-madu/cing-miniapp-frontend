import {
  useEffect,
} from "react";

import {
  recoverRealtimeAuth,
} from "../services/authRealtimeRecovery";

export function useVisibilitySessionRecovery() {

  useEffect(() => {

    function handleVisibility() {

      if (

        document.visibilityState ===
        "visible"

      ) {

        recoverRealtimeAuth();

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