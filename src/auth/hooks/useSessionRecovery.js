import {
  useEffect,
} from "react";

import {
  restoreSession,
} from "../services/authSessionService";

export function useSessionRecovery() {

  useEffect(() => {

    restoreSession();

  }, []);

}