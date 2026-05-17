import { useEffect } from "react";

import {
  bootstrapMobileOptimization,
} from "../bootstrap/mobileOptimizationBootstrap";

import {
  useLowMemoryMode,
} from "./useLowMemoryMode";

import {
  useVisibilityRecovery,
} from "./useVisibilityRecovery";

import {
  useScrollOptimization,
} from "./useScrollOptimization";

export function useMobileOptimization() {

  useLowMemoryMode();

  useVisibilityRecovery();

  useScrollOptimization();

  useEffect(() => {

    bootstrapMobileOptimization();

  }, []);

}