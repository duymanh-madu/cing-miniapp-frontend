import {
  createOfflineRevivalLifecycleCoordinator,
} from "./offlineRevivalLifecycleCoordinator.js";

import {
  ensureOfflineRevivalOperationIntent,
  clearOfflineRevivalOperationIntent,
} from "./offlineRevivalOperationIntent.js";

/*
 * The lifecycle coordinator validates PostgreSQL results.
 * This adapter persists operation identity before HTTP.
 *
 * A replay must use the durable request_id, never the
 * newly generated in-memory request_id after a reload.
 *
 * No balance, credit cost or session owner is submitted
 * as financial authority.
 */
export function createOfflineRevivalDurableCoordinator({
  storage,
  userId,
  gameKey,
  sessionId,
  eventSeq,
  revivesUsed,
  initialStatus = "active",
  initialPendingEventId = null,
  initialPendingReason = null,
  createRequestId,
  markPending,
  applyRevival,
}) {
  if (
    typeof createRequestId !== "function" ||
    typeof markPending !== "function" ||
    typeof applyRevival !== "function"
  ) {
    const error = new Error(
      "Thiếu dịch vụ hồi sinh"
    );
    error.code =
      "REVIVAL_DURABLE_CONFIG_INVALID";
    throw error;
  }

  const owner = {
    storage,
    userId,
    gameKey,
    sessionId,
  };

  let pendingIntent = null;
  let reviveIntent = null;

  const lifecycle =
    createOfflineRevivalLifecycleCoordinator({
      sessionId,
      eventSeq,
      revivesUsed,
      createRequestId,

      markPending:
        async (input) => {
          pendingIntent =
            ensureOfflineRevivalOperationIntent({
              ...owner,
              operation: "pending",
              expectedEventSeq:
                input.expectedEventSeq,
              reason: input.reason,
              createRequestId:
                () => input.requestId,
            });

          return markPending({
            ...input,
            requestId:
              pendingIntent.request_id,
          });
        },

      applyRevival:
        async (input) => {
          reviveIntent =
            ensureOfflineRevivalOperationIntent({
              ...owner,
              operation: "revive",
              expectedEventSeq:
                input.expectedEventSeq,
              pendingEventId:
                input.pendingEventId,
              createRequestId:
                () => input.requestId,
            });

          return applyRevival({
            ...input,
            requestId:
              reviveIntent.request_id,
          });
        },
    });

  /*
   * A pending session reconstructed from the backend
   * is intentionally NOT allowed to call revive through
   * this adapter until the base coordinator supports
   * verified pending-state initialization.
   */
  if (
    initialStatus !== "active" ||
    initialPendingEventId !== null ||
    initialPendingReason !== null
  ) {
    const error = new Error(
      "Cần xác minh trạng thái hồi sinh từ backend"
    );
    error.code =
      "REVIVAL_DURABLE_RECOVERY_REQUIRED";
    throw error;
  }

  async function enterPending(reason) {
    const result =
      await lifecycle.enterPending(reason);

    if (
      result.status === "pending" &&
      pendingIntent
    ) {
      clearOfflineRevivalOperationIntent({
        ...owner,
        operation: "pending",
        requestId:
          pendingIntent.request_id,
      });

      pendingIntent = null;
    }

    return result;
  }

  async function revive() {
    const result =
      await lifecycle.revive();

    if (
      result.status === "resumed" &&
      reviveIntent
    ) {
      clearOfflineRevivalOperationIntent({
        ...owner,
        operation: "revive",
        requestId:
          reviveIntent.request_id,
      });

      reviveIntent = null;
    }

    return result;
  }

  return Object.freeze({
    snapshot:
      () => lifecycle.snapshot(),
    enterPending,
    revive,
  });
}
