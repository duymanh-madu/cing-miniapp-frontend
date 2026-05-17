import {
  useEffect,
} from "react";

export function useVisibilityRenderPause({

  onPause,

  onResume,

}) {

  useEffect(() => {

    function handleVisibility() {

      if (

        document.visibilityState ===
        "hidden"

      ) {

        onPause?.();

      }

      if (

        document.visibilityState ===
        "visible"

      ) {

        onResume?.();

      }

    }

    document.addEventListener(

      "visibilitychange",

      handleVisibility

    );

    return () => {

      document.removeEventListener(

        "visibilitychange",

        handleVisibility

      );

    };

  }, [

    onPause,

    onResume,

  ]);

}