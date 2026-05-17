import {
  bootstrapSequence,
} from "./bootstrapSequence";

import {
  bootstrapAuthLayer,
} from "@/auth/bootstrap/authBootstrap";

import {
  bootstrapRealtimeLayer,
} from "@/realtime/bootstrap/realtimeBootstrap";

import {
  bootstrapAnalyticsLayer,
} from "@/analytics/bootstrap/analyticsBootstrap";

import {
  bootstrapCmsLayer,
} from "@/cms/bootstrap/cmsBootstrap";

import {
  bootstrapPerformanceLayer,
} from "@/performance/bootstrap/performanceBootstrap";

import {
  bootstrapRuntimeLayer,
} from "@/runtime/bootstrap/runtimeBootstrap";

import {
  bootstrapStabilityLayer,
} from "@/stability/bootstrap/stabilityBootstrap";

import {
  bootstrapDeploymentLayer,
} from "@/deployment/bootstrap/deploymentBootstrap";

export async function initializeApplication() {

  await bootstrapSequence({

    layers: [

      bootstrapDeploymentLayer,

      bootstrapAuthLayer,

      bootstrapRealtimeLayer,

      bootstrapAnalyticsLayer,

      bootstrapCmsLayer,

      bootstrapPerformanceLayer,

      bootstrapRuntimeLayer,

      bootstrapStabilityLayer,

    ],

  });

}