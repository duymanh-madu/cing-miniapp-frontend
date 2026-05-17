import {
  useAdminStore,
} from "../store/adminStore";

export function connectAdminRealtime({
  socket,
}) {

  socket.on(
    "admin.activity",
    (payload) => {

      useAdminStore
        .getState()
        .pushActivityLog(
          payload
        );

    }
  );

  socket.on(
    "admin.alert",
    (payload) => {

      useAdminStore
        .getState()
        .pushRealtimeAlert(
          payload
        );

    }
  );

}