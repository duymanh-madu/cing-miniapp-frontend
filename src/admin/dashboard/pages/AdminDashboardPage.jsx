import {
  useEffect,
} from "react";

import analyticsBootstrap from "@/admin/analytics/analyticsBootstrap";

import adminRealtimeAnalyticsSocket from "@/admin/realtime/adminRealtimeAnalyticsSocket";

import useAnalyticsStore from "@/admin/analytics/analyticsStore";

import RealtimeMetricCard from "../widgets/RealtimeMetricCard";

import RealtimeFeedWidget from "../widgets/RealtimeFeedWidget";

function AdminDashboardPage() {

  const metrics =
    useAnalyticsStore(
      (
        state
      ) => state.metrics
    );

  useEffect(() => {

    analyticsBootstrap
      .bootstrap();

    adminRealtimeAnalyticsSocket
      .initialize();

  }, []);

  return (

    <div
      className="
        space-y-6
      "
    >

      <div
        className="
          grid
          grid-cols-1
          gap-4
          md:grid-cols-2
          xl:grid-cols-4
        "
      >

        <RealtimeMetricCard
          label="Revenue"
          value={
            metrics.revenueToday
          }
        />

        <RealtimeMetricCard
          label="Orders"
          value={
            metrics.ordersToday
          }
        />

        <RealtimeMetricCard
          label="Realtime Users"
          value={
            metrics.activeUsers
          }
        />

        <RealtimeMetricCard
          label="Campaigns"
          value={
            metrics.activeCampaigns
          }
        />

      </div>

      <RealtimeFeedWidget />

    </div>

  );

}

export default
  AdminDashboardPage;