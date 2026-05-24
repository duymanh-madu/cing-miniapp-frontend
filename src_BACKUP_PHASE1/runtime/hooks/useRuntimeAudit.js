import {
  useEffect,
} from "react";

import {
  auditMemoryPressure,
} from "../services/runtimeMemoryAudit";

export function useRuntimeAudit() {

  useEffect(() => {

    const interval =
      setInterval(() => {

        auditMemoryPressure();

      }, 30000);

    return () => {

      clearInterval(
        interval
      );

    };

  }, []);

}