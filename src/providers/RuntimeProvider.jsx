import {
  useEffect,
} from "react";

import useRuntimeStore
  from "@/stores/runtimeStore";

/**
 * =========================================================
 * RUNTIME PROVIDER
 * =========================================================
 */

function RuntimeProvider({
  children,
}) {

  const setLoading =
    useRuntimeStore(
      (state) =>
        state.setLoading
    );

  useEffect(() => {

    /**
     * MOCK BOOTSTRAP
     */

    setLoading(false);

  }, []);

  return children;

}

export default
  RuntimeProvider;