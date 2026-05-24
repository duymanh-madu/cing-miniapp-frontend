import {
  useEffect,
} from "react";

import {
  applyIosViewportFix,
} from "../services/iosViewportService";

import {
  applyIosSafeArea,
} from "../services/iosSafeAreaService";

import {
  enableIosMomentumScroll,
} from "../services/iosMomentumScrollService";

export function useIosSafeArea() {

  useEffect(() => {

    applyIosViewportFix();

    applyIosSafeArea();

    enableIosMomentumScroll();

    window.addEventListener(
      "resize",
      applyIosViewportFix
    );

    return () => {

      window.removeEventListener(
        "resize",
        applyIosViewportFix
      );

    };

  }, []);

}