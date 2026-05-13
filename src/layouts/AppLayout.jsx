import {
  Outlet,
} from "react-router-dom";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import BottomNavigation from "../components/navigation/BottomNavigation";

import AppSplashScreen from "../components/loaders/AppSplashScreen";

import MaintenanceScreen from "../components/system/MaintenanceScreen";

import GlobalNetworkIndicator from "../components/system/GlobalNetworkIndicator";

import useAppStore from "../stores/appStore";

import useConfigStore from "../stores/configStore";

/**
 * ============================================
 * APP LAYOUT
 * ============================================
 */

function AppLayout() {
  /**
   * APP STORE
   */

  const appReady =
    useAppStore(
      (state) =>
        state.appReady
    );

  /**
   * CONFIG
   */

  const maintenanceMode =
    useConfigStore(
      (state) =>
        state.config
          .maintenance_mode
    );

  /**
   * SPLASH
   */

  if (!appReady) {
    return (
      <AppSplashScreen />
    );
  }

  /**
   * MAINTENANCE
   */

  if (
    maintenanceMode
  ) {
    return (
      <MaintenanceScreen />
    );
  }

  return (
    <div
      className="
        min-h-screen
        bg-[#f7f1e8]
      "
    >
      {/* NETWORK */}

      <GlobalNetworkIndicator />

      {/* PAGE */}

      <main
        className="
          pb-[120px]
        "
      >
        <AnimatePresence
          mode="wait"
        >
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.25,
            }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* NAVIGATION */}

      <BottomNavigation />
    </div>
  );
}

export default AppLayout;