import { useEffect }
  from "react";

import registerQueryInvalidation from "@/services/http/registerQueryInvalidation";

function RealtimeProvider({
  children,
}) {

  useEffect(() => {

    const cleanup =
      registerQueryInvalidation();

    return () => {

      cleanup();

    };

  }, []);

  return children;

}

export default
  RealtimeProvider;