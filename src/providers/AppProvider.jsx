import {
  useEffect,
} from "react";

import QueryProvider from "./QueryProvider";

import {
  useSocket,
}
from "@/providers/SocketProvider";

import ThemeProvider from "./ThemeProvider";

import AppToast from "../components/toast/AppToast";

import useAppStore from "../stores/appStore";

import useAppConfig from "../hooks/useAppConfig";

import useAuthSession from "../hooks/useAuthSession";

import useSystemBootstrap from "../hooks/useSystemBootstrap";

import useRealtimeNotifications from "../hooks/useRealtimeNotifications";

import {
  initializeConfigRealtime,
  destroyConfigRealtime,
} from "../realtime/configEvents";

/**
 * ============================================
 * BOOT MANAGER
 * ============================================
 */

function BootManager() {
  /**
   * APP STORE
   */

  const setAppReady =
    useAppStore(
      (state) =>
        state.setAppReady
    );

  const setAppBooting =
    useAppStore(
      (state) =>
        state.setAppBooting
    );

  /**
   * AUTH SESSION
   */

  useAuthSession();

  /**
   * SYSTEM
   */

  useSystemBootstrap();

  /**
   * CONFIG
   */

  const {
    loading,
  } = useAppConfig();

  /**
   * REALTIME CONFIG
   */

  useEffect(() => {
    initializeConfigRealtime();

    return () => {
      destroyConfigRealtime();
    };
  }, []);

  /**
   * NOTIFICATIONS
   */

  useRealtimeNotifications();

  /**
   * APP BOOT
   */

  useEffect(() => {
    if (!loading) {
      setAppReady(
        true
      );

      setAppBooting(
        false
      );
    }
  }, [
    loading,
    setAppReady,
    setAppBooting,
  ]);

  return null;
}

/**
 * ============================================
 * APP PROVIDER
 * ============================================
 */

function AppProvider({
  children,
}) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <SocketProvider>
          <BootManager />

          {children}

          <AppToast />
        </SocketProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

export default AppProvider;