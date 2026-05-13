import {
  useEffect,
} from "react";

import useSystemStore from "../stores/systemStore";

/**
 * ============================================
 * USE SYSTEM BOOTSTRAP
 * ============================================
 */

function useSystemBootstrap() {
  const setInitialized =
    useSystemStore(
      (state) =>
        state.setInitialized
    );

  const setBootCompleted =
    useSystemStore(
      (state) =>
        state.setBootCompleted
    );

  const setOnline =
    useSystemStore(
      (state) =>
        state.setOnline
    );

  /**
   * SYSTEM BOOT
   */

  useEffect(() => {
    setInitialized(
      true
    );

    setBootCompleted(
      true
    );
  }, [
    setInitialized,
    setBootCompleted,
  ]);

  /**
   * NETWORK
   */

  useEffect(() => {
    function handleOnline() {
      setOnline(true);
    }

    function handleOffline() {
      setOnline(false);
    }

    window.addEventListener(
      "online",
      handleOnline
    );

    window.addEventListener(
      "offline",
      handleOffline
    );

    return () => {
      window.removeEventListener(
        "online",
        handleOnline
      );

      window.removeEventListener(
        "offline",
        handleOffline
      );
    };
  }, [setOnline]);
}

export default useSystemBootstrap;