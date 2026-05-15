import {
  useEffect,
} from "react";

import analyticsBootstrap from "../analytics/analyticsBootstrap";

import adminRealtimeAnalyticsSocket from "../realtime/adminRealtimeAnalyticsSocket";

import socketMonitoringSocket from "../monitoring/socketMonitoringSocket";

import eventFeedSocket from "../events/eventFeedSocket";

function AdminAnalyticsProvider({
  children,
}) {

  useEffect(() => {

    analyticsBootstrap
      .bootstrap();

    adminRealtimeAnalyticsSocket
      .initialize();

    socketMonitoringSocket
      .initialize();

    eventFeedSocket
      .initialize();

  }, []);

  return children;

}

export default
  AdminAnalyticsProvider;