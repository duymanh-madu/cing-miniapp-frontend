import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {

  useEffect,
} from "react";

/**
 * =====================================================
 * APP READY
 * =====================================================
 */

export function useAppReady() {

  useEffect(() => {

    runtimeLogger.info("APP", 
      "[APP] READY"
    );

  }, []);

}