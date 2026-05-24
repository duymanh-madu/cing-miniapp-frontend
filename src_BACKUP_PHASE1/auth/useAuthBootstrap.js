import {
  useEffect,
} from "react";

import {
  bootstrapAuth,
} from "./bootstrapAuth";

export function useAuthBootstrap() {

  useEffect(() => {

    bootstrapAuth();

  }, []);

}