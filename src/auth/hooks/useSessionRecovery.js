import {
  useEffect,
} from "react";

import {
  restoreSession,
} from "../infra/authSessionService";

export function useSessionRecovery() {

  useEffect(() => {

    restoreSession();

  }, []);

}