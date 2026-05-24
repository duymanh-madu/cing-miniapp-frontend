import { useEffect, useState } from "react";

function getResponsiveState() {
  const width =
    window.innerWidth;

  return {
    width,

    mobile:
      width < 768,

    tablet:
      width >= 768 &&
      width < 1024,

    desktop:
      width >= 1024,
  };
}

export function useResponsive() {
  const [state, setState] =
    useState(
      getResponsiveState
    );

  useEffect(() => {
    function handleResize() {
      setState(
        getResponsiveState()
      );
    }

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  return state;
}