import {
  Suspense,
} from "react";

import AppRouter from "@/router/AppRouter";

import RuntimeProvider from "@/providers/RuntimeProvider";

import QueryProvider from "@/providers/QueryProvider";

import MonitoringProvider from "@/providers/MonitoringProvider";

import PlatformProvider from "@/providers/PlatformProvider";

import AppErrorBoundary from "@/components/system/AppErrorBoundary";

import LoadingScreen from "@/components/ui/LoadingScreen";

/**
 * =========================================================
 * APP SHELL
 * =========================================================
 */

function AppShell() {

  return (

    <AppErrorBoundary>

      <MonitoringProvider>

        <PlatformProvider>

          <QueryProvider>

            <RuntimeProvider>

              <Suspense
                fallback={
                  <LoadingScreen />
                }
              >

                <AppRouter />

              </Suspense>

            </RuntimeProvider>

          </QueryProvider>

        </PlatformProvider>

      </MonitoringProvider>

    </AppErrorBoundary>

  );

}

export default
  AppShell;