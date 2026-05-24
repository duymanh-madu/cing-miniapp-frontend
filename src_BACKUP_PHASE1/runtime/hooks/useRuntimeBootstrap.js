import {
  useEffect,
} from "react";

import {
  bootstrapRuntime,
} from "@/runtime/runtimeBootstrap";

/**
 * =====================================================
 * RUNTIME BOOTSTRAP HOOK
 * =====================================================
 */

function useRuntimeBootstrap() {

  useEffect(() => {

    bootstrapRuntime();

  }, []);

}

export default
  useRuntimeBootstrap;
