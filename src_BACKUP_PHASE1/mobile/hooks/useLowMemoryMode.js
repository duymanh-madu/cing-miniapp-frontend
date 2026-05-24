import { useEffect } from "react";

export function useLowMemoryMode() {

  useEffect(() => {

    if (
      navigator.deviceMemory &&
      navigator.deviceMemory <= 4
    ) {

      document.body.classList.add(
        "low-memory-mode"
      );

    }

  }, []);

}