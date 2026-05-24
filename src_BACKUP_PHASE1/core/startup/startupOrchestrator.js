import sessionHydrator from "@/core/session/sessionHydrator";

import hydrationCache from "@/core/cache/hydrationCache";

import runtimeWarmCache from "@/core/cache/runtimeWarmCache";

import routePreloader from "@/core/router/routePreloader";

import offlineSnapshotRuntime from "@/core/offline/offlineSnapshotRuntime";


import startupMetricsRuntime from "@/core/startup/startupMetricsRuntime";

import remoteConfigRuntime from "@/cms/runtime/remoteConfigRuntime";

class StartupOrchestrator {

  async start() {

    startupMetricsRuntime
      .start();

    await remoteConfigRuntime
      .initialize();

    await Promise.all([

      hydrationCache
        .restore(),

      sessionHydrator
        .restore(),

      offlineSnapshotRuntime
        .restore(),

    ]);

    runtimeWarmCache
      .warm();

    routePreloader
      .preload();

    startupMetricsRuntime
      .end();

  }

}

const startupOrchestrator =
  new StartupOrchestrator();

export default
  startupOrchestrator;