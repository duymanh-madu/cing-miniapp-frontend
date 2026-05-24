import { useEffect }
  from "react";

import registerMenuRealtime
  from "../realtime/registerMenuRealtime";

function useRegisterMenuRealtime() {

  useEffect(() => {

    const cleanup =
      registerMenuRealtime();

    return () => {

      cleanup();

    };

  }, []);

}

export default
  useRegisterMenuRealtime;