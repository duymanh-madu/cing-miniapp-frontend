import {
  useDashboardRealtimeStore,
} from "../stores/dashboardRealtimeStore";

export function connectDashboardRealtime({
  socket,
}) {

  socket.on(
    "dashboard.activity",
    (payload) => {

      useDashboardRealtimeStore
        .getState()
        .pushActivity(payload);

    }
  );

  socket.on(
    "dashboard.leaderboard",
    (payload) => {

      useDashboardRealtimeStore
        .getState()
        .updateLeaderboard(payload);

    }
  );

  socket.on(
    "dashboard.revenue",
    (payload) => {

      useDashboardRealtimeStore
        .getState()
        .updateRevenue(payload.amount);

    }
  );

  socket.on(
    "dashboard.presence",
    (payload) => {

      useDashboardRealtimeStore
        .getState()
        .updatePresence(payload.count);

    }
  );

  socket.on(
    "dashboard.orders",
    (payload) => {

      useDashboardRealtimeStore
        .getState()
        .updateOrders(payload);

    }
  );

}