import {
  useEffect,
} from "react";

import {
  recoverAndroidWebView,
} from "../services/androidRecoveryService";

export function useAndroidRecovery() {

  useEffect(() => {

    window.addEventListener(
      "focus",
      recoverAndroidWebView
    );

    return () => {

      window.removeEventListener(
        "focus",
        recoverAndroidWebView
      );

    };

  }, []);

}