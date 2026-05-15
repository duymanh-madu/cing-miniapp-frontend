import sessionHydrator from "@/core/session/sessionHydrator";

import hydrationCache from "@/core/cache/hydrationCache";

import runtimeWarmCache from "@/core/cache/runtimeWarmCache";

import routePreloader from "@/core/router/routePreloader";

import offlineSnapshotRuntime from "@/core/offline/offlineSnapshotRuntime";

import socketRecoveryRuntime from "@/core/socket/socketRecoveryRuntime";

import startupMetricsRuntime from "@/core/startup/startupMetricsRuntime";

class StartupOrchestrator {

  async start() {

    startupMetricsRuntime.start();

    await Promise.all([

      hydrationCache.restore(),

      sessionHydrator.restore(),

      offlineSnapshotRuntime.restore(),

    ]);

    runtimeWarmCache.warm();

    routePreloader.preload();

    socketRecoveryRuntime.initialize();

    startupMetricsRuntime.end();

  }

}

const startupOrchestrator =
  new StartupOrchestrator();

export default startupOrchestrator;