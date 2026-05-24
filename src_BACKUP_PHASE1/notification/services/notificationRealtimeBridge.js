import {
  useNotificationStore,
} from "../store/runtimeNotificationStore";

export function connectNotificationRealtime({
  socket,
}) {

  socket.on(
    "notification",
    (payload) => {

      useNotificationStore
        .getState()
        .pushNotification(payload);

    }
  );

}