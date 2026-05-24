import {
  useEffect,
} from "react";

import {
  logRelease,
} from "../services/releaseLogger";

export function useReleaseTracking({

  version,

}) {

  useEffect(() => {

    logRelease({

      version,

      environment:

        import.meta.env.MODE,

    });

  }, [version]);

}