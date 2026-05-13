import socketClient
  from "@/realtime/socket";

import useAppStore
  from "@/stores/appStore";

/**
 * =========================================================
 * REALTIME BUSINESS ORCHESTRATION
 * =========================================================
 */

let initialized = false;

/**
 * =========================================================
 * SAFE PAYLOAD
 * =========================================================
 */

function safeObject(
  value
) {
  return (
    value &&
    typeof value === "object"
  )
    ? value
    : {};
}

/**
 * =========================================================
 * INITIALIZE REALTIME
 * =========================================================
 */

export function initializeRealtime() {

  /**
   * PREVENT DUPLICATE INIT
   */

  if (initialized) {
    return;
  }

  initialized = true;

  /**
   * STORE API
   */

  const store =
    useAppStore.getState();

  /**
   * SOCKET CONNECT
   */

  socketClient.connect();

  /**
   * =======================================================
   * CONNECT
   * =======================================================
   */

  const handleConnect =
    () => {

      console.log(
        "🟢 Realtime connected"
      );

      store.setSocketConnected(
        true
      );

      store.setReconnecting(
        false
      );
    };

  /**
   * =======================================================
   * DISCONNECT
   * =======================================================
   */

  const handleDisconnect =
    () => {

      console.log(
        "🔴 Realtime disconnected"
      );

      store.setSocketConnected(
        false
      );
    };

  /**
   * =======================================================
   * RECONNECT
   * =======================================================
   */

  const handleReconnectAttempt =
    () => {

      store.setReconnecting(
        true
      );
    };

  /**
   * =======================================================
   * NOTIFICATION
   * =======================================================
   */

  const handleNotification =
    (payload) => {

      const safePayload =
        safeObject(payload);

      console.log(
        "🔔 Notification",
        safePayload
      );

      store.incrementNotifications();
    };

  /**
   * =======================================================
   * MEMBER POINTS
   * =======================================================
   */

  const handleMemberPoints =
    (payload) => {

      const safePayload =
        safeObject(payload);

      store.setMemberPoints(
        Number(
          safePayload.points
        ) || 0
      );

      if (
        safePayload.tier
      ) {

        store.setMemberTier(
          safePayload.tier
        );
      }
    };

  /**
   * =======================================================
   * LEADERBOARD
   * =======================================================
   */

  const handleLeaderboard =
    (payload) => {

      console.log(
        "🏆 Leaderboard updated",
        safeObject(payload)
      );
    };

  /**
   * =======================================================
   * GAME START
   * =======================================================
   */

  const handleGameStarted =
    () => {

      store.setGamePlaying(
        true
      );
    };

  /**
   * =======================================================
   * GAME END
   * =======================================================
   */

  const handleGameEnded =
    () => {

      store.setGamePlaying(
        false
      );
    };

  /**
   * =======================================================
   * MENU UPDATE
   * =======================================================
   */

  const handleMenuUpdated =
    (payload) => {

      console.log(
        "🧋 Menu updated",
        safeObject(payload)
      );
    };

  /**
   * =======================================================
   * VOUCHER
   * =======================================================
   */

  const handleVoucher =
    (payload) => {

      console.log(
        "🎁 Voucher received",
        safeObject(payload)
      );
    };

  /**
   * =======================================================
   * CAMPAIGN
   * =======================================================
   */

  const handleCampaign =
    (payload) => {

      console.log(
        "🚀 Campaign started",
        safeObject(payload)
      );
    };

  /**
   * =======================================================
   * REGISTER EVENTS
   * =======================================================
   */

  socketClient.on(
    "connect",
    handleConnect
  );

  socketClient.on(
    "disconnect",
    handleDisconnect
  );

  socketClient.on(
    "reconnect_attempt",
    handleReconnectAttempt
  );

  socketClient.on(
    "notification:new",
    handleNotification
  );

  socketClient.on(
    "member:points_updated",
    handleMemberPoints
  );

  socketClient.on(
    "leaderboard:update",
    handleLeaderboard
  );

  socketClient.on(
    "game:started",
    handleGameStarted
  );

  socketClient.on(
    "game:ended",
    handleGameEnded
  );

  socketClient.on(
    "menu:updated",
    handleMenuUpdated
  );

  socketClient.on(
    "voucher:new",
    handleVoucher
  );

  socketClient.on(
    "campaign:started",
    handleCampaign
  );

  /**
   * =======================================================
   * APP READY
   * =======================================================
   */

  store.setAppReady(
    true
  );

  store.setAppBooting(
    false
  );
}

/**
 * =========================================================
 * DESTROY REALTIME
 * =========================================================
 */

export function destroyRealtime() {

  initialized = false;

  socketClient.removeAllListeners();

  socketClient.disconnect();
}