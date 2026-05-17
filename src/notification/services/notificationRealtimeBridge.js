import {
  useNotificationStore,
} from "../store/notificationStore";

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