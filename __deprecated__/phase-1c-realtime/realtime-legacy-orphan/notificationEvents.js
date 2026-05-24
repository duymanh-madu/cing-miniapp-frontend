import useNotificationStore from "@/notification/store/runtimeNotificationStore";

/**
 * =========================================================
 * NOTIFICATION REALTIME STATE
 * =========================================================
 */

let initialized =
  false;

/**
 * =========================================================
 * HANDLERS
 * =========================================================
 */

let handleNotificationCreated;

/**
 * =========================================================
 * INITIALIZE NOTIFICATION EVENTS
 * =========================================================
 */

export function
initializeNotificationEvents(
  socket
) {

  /**
   * =======================================================
   * SOCKET REQUIRED
   * =======================================================
   */

  if (
    !socket
  ) {

    return;

  }

  /**
   * =======================================================
   * PREVENT DUPLICATE
   * =======================================================
   */

  if (
    initialized
  ) {

    return;

  }

  initialized =
    true;

  /**
   * =======================================================
   * NOTIFICATION CREATED
   * =======================================================
   */

  handleNotificationCreated =
    (payload) => {

      /**
       * ===================================================
       * VALIDATE
       * ===================================================
       */

      if (
        !payload ||
        !payload.notification
      ) {

        return;

      }

      console.log(
        "🔔 NOTIFICATION RECEIVED",
        payload
      );

      /**
       * ===================================================
       * PUSH NOTIFICATION
       * ===================================================
       */

      useNotificationStore
        .getState()
        .pushNotification(
          payload.notification
        );

    };

  /**
   * =======================================================
   * REGISTER EVENTS
   * =======================================================
   */

  socket.on(
    "notification_created",
    handleNotificationCreated
  );

  console.log(
    "🟢 NOTIFICATION EVENTS INITIALIZED"
  );

}

/**
 * =========================================================
 * DESTROY NOTIFICATION EVENTS
 * =========================================================
 */

export function
destroyNotificationEvents(
  socket
) {

  /**
   * =======================================================
   * SOCKET REQUIRED
   * =======================================================
   */

  if (
    !socket
  ) {

    return;

  }

  /**
   * =======================================================
   * RESET
   * =======================================================
   */

  initialized =
    false;

  /**
   * =======================================================
   * REMOVE LISTENERS
   * =======================================================
   */

  socket.off(
    "notification_created",
    handleNotificationCreated
  );

  console.log(
    "🔴 NOTIFICATION EVENTS DESTROYED"
  );

}