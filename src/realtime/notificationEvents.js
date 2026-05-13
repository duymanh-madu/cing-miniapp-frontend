import {
  useSocket,
}
from "@/providers/SocketProvider";

import useNotificationStore from "../stores/notificationStore";

/**
 * ============================================
 * NOTIFICATION EVENTS
 * ============================================
 */

export function initializeNotificationEvents() {
  socket.on(
    "notification_created",
    (payload) => {
      useNotificationStore
        .getState()
        .pushNotification(
          payload.notification
        );
    }
  );
}

/**
 * ============================================
 * DESTROY EVENTS
 * ============================================
 */

export function destroyNotificationEvents() {
  socket.off(
    "notification_created"
  );
}