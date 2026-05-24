import { useEffect } from "react";

import {
  bootstrapMobileOptimization,
} from "../bootstrap/mobileOptimizationBootstrap";

import {
  useLowMemoryMode,
} from "./useLowMemoryMode";


import {
  useScrollOptimization,
} from "./useScrollOptimization";

export function useMobileOptimization() {

  useLowMemoryMode();

  useScrollOptimization();

  useEffect(() => {

    bootstrapMobileOptimization();

  }, []);

}