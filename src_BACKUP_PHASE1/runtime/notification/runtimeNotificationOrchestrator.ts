import {
  useRuntimeNotificationStore,
} from "./runtimeNotificationStore";

import {
  showRuntimeToast,
} from "./runtimeNotificationToastManager";

import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {

  NOTIFICATION_PRIORITIES,
} from "./runtimeNotificationConstants";

export function dispatchRuntimeNotification(
  payload: {

    title: string;

    message: string;

    priority?: string;

  }
) {

  const notification = {

    id:
      crypto.randomUUID(),

    title:
      payload.title,

    message:
      payload.message,

    priority:
      payload.priority ||
      NOTIFICATION_PRIORITIES.NORMAL,

    read:
      false,

    createdAt:
      new Date()
        .toISOString(),

  };

  useRuntimeNotificationStore
    .getState()
    .pushNotification(
      notification
    );

  showRuntimeToast({

    title:
      notification.title,

    message:
      notification.message,

  });

  runtimeLogger.info("RUNTIME", 
    "[NOTIFICATION] Runtime dispatched",
    notification
  );

}