import {
  useEffect,
  useState,
} from "react";

import networkStateManager from "@/services/offline/networkStateManager";

/**
 * =========================================================
 * USE NETWORK STATE
 * =========================================================
 */

function useNetworkState() {
  const [
    online,
    setOnline,
  ] = useState(
    networkStateManager.isOnline()
  );

  useEffect(() => {
    return networkStateManager.subscribe(
      setOnline
    );
  }, []);

  return {
    online,
  };
}

export default useNetworkState;