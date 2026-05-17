import {
  useEffect,
} from "react";

export function useScrollOptimization() {

  useEffect(() => {

    let ticking =
      false;

    function onScroll() {

      if (ticking) {

        return;

      }

      ticking =
        true;

      requestAnimationFrame(() => {

        ticking =
          false;

      });

    }

    window.addEventListener(
      "scroll",
      onScroll,
      {
        passive: true,
      }
    );

    return () => {

      window.removeEventListener(
        "scroll",
        onScroll
      );

    };

  }, []);

}