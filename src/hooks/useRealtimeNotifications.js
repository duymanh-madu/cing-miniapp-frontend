import {
  useEffect,
} from "react";

import {
  initializeNotificationEvents,
  destroyNotificationEvents,
} from "../realtime/notificationEvents";

/**
 * ============================================
 * USE REALTIME NOTIFICATIONS
 * ============================================
 */

function useRealtimeNotifications() {
  useEffect(() => {
    initializeNotificationEvents();

    return () => {
      destroyNotificationEvents();
    };
  }, []);
}

export default useRealtimeNotifications;