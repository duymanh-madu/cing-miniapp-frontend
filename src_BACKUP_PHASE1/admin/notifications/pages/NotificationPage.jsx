import {
  useEffect,
} from "react";

import notificationBootstrap from "../notificationBootstrap";

import notificationRealtimeSocket from "../notificationRealtimeSocket";

import useNotificationStore from "../adminNotificationStore";

import NotificationMetricsGrid from "../components/NotificationMetricsGrid";

import NotificationBuilderForm from "../components/NotificationBuilderForm";

import RealtimeDeliveryFeed from "../components/RealtimeDeliveryFeed";

function NotificationPage() {

  const {

    deliveryMetrics,

    realtimeDeliveries,

  } = useNotificationStore();

  useEffect(() => {

    notificationBootstrap
      .bootstrap();

    notificationRealtimeSocket
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
          text-3xl
          font-black
        "
      >
        Omnichannel Communication Platform
      </div>

      <NotificationMetricsGrid
        metrics={
          deliveryMetrics
        }
      />

      <NotificationBuilderForm />

      <RealtimeDeliveryFeed
        deliveries={
          realtimeDeliveries
        }
      />

    </div>

  );

}

export default
  NotificationPage;