import {
  useRuntimeNotificationStore,
} from "./runtimeNotificationStore";

export function getUnreadNotificationCount() {

  return useRuntimeNotificationStore
    .getState()
    .unreadCount;

}