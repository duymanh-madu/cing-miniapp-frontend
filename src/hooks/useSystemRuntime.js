import { useEffect } from "react";

import runtimeBootstrapper from "@/services/runtime/runtimeBootstrapper";

/**
 * =========================================================
 * USE SYSTEM RUNTIME
 * =========================================================
 */

function useSystemRuntime() {
  useEffect(() => {
    runtimeBootstrapper.bootstrap();
  }, []);
}

export default useSystemRuntime;