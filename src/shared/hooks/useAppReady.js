import { useEffect } from "react";

import {
  bootstrapApp,
} from "@/app/bootstrapApp";

import {
  markAppReady,
} from "@/app/appReady";

export function useAppReady() {
  useEffect(() => {
    const cleanup =
      bootstrapApp();

    markAppReady();

    return () => {
      cleanup?.();
    };
  }, []);
}