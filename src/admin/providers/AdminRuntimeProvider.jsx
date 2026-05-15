import {
  useEffect,
} from "react";

import cmsBootstrap from "../cms/cmsBootstrap";

import runtimeConfigBootstrap from "../config/runtimeConfigBootstrap";

import featureFlagBootstrap from "../featureFlags/featureFlagBootstrap";

import AdminAnalyticsProvider from "./AdminAnalyticsProvider";

/**
 * =========================================================
 * ADMIN RUNTIME PROVIDER
 * =========================================================
 *
 * RESPONSIBILITIES:
 *
 * - bootstrap runtime config
 * - bootstrap cms runtime
 * - bootstrap feature flags
 * - bootstrap analytics runtime
 * - bootstrap realtime monitoring
 * - bootstrap admin operational layer
 *
 * PRINCIPLES:
 *
 * - no hardcode
 * - no fake data
 * - no duplicate runtime
 * - realtime first
 * - remote config driven
 * - production orchestration
 *
 * =========================================================
 */

function AdminRuntimeProvider({
  children,
}) {

  useEffect(() => {

    /**
     * =========================================
     * REMOTE CONFIG
     * =========================================
     */

    runtimeConfigBootstrap
      .bootstrap();

    /**
     * =========================================
     * CMS RUNTIME
     * =========================================
     */

    cmsBootstrap
      .bootstrap();

    /**
     * =========================================
     * FEATURE FLAGS
     * =========================================
     */

    featureFlagBootstrap
      .bootstrap();

  }, []);

  return (

    <AdminAnalyticsProvider>

      {children}

    </AdminAnalyticsProvider>

  );

}

export default
  AdminRuntimeProvider;