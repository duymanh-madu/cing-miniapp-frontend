import {
  readOfflineRevivalStartIntent,
  ensureOfflineRevivalStartIntent,
  authorizeOfflineRevivalStartIntent,
  clearOfflineRevivalStartIntent,
} from "./offlineRevivalStartIntent.js";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

function validateSession(
  result,
  requestId,
  gameKey
) {
  if (
    !result ||
    typeof result.session_id !== "string" ||
    !UUID.test(result.session_id) ||
    (
      result.request_id !== undefined &&
      result.request_id !== requestId
    ) ||
    (
      result.game_key !== undefined &&
      result.game_key !== gameKey
    ) ||
    !Number.isInteger(
      result.event_seq
    ) ||
    result.event_seq < 0 ||
    !Number.isInteger(
      result.revives_used
    ) ||
    result.revives_used < 0 ||
    result.revives_used > 5
  ) {
    fail(
      "OFFLINE_REVIVAL_START_RESPONSE_INVALID",
      "Không thể xác minh phiên chơi"
    );
  }

  return result;
}

function validateAbandon(
  result,
  sessionId,
  expectedEventSeq
) {
  if (
    !result ||
    (
      result.applied !== true &&
      result.applied !== false
    ) ||
    result.session_id !==
      sessionId ||
    result.session_status !==
      "abandoned" ||
    result.event_seq !==
      expectedEventSeq ||
    !Number.isInteger(
      result.revives_used
    ) ||
    result.revives_used < 0 ||
    result.revives_used > 5 ||
    typeof result.abandoned_at !==
      "string" ||
    !Number.isFinite(
      Date.parse(
        result.abandoned_at
      )
    )
  ) {
    fail(
      "OFFLINE_REVIVAL_ABANDON_RESPONSE_INVALID",
      "Không thể xác minh việc đóng phiên cũ"
    );
  }

  return result;
}

/*
 * Free-start durable admission:
 *
 * start_pending + recovered active:
 *   POST may have committed while its response
 *   was lost. The game was never authorized
 *   locally, so authorize the same session.
 *
 * authorized + active/revive_pending:
 *   Gameplay was previously authorized but the
 *   current canvas is gone. The runtime cannot
 *   reconstruct that gameplay state or its
 *   in-memory pending result. Close that exact
 *   backend session through safe-abandon before
 *   creating a fresh session.
 *
 * finalized/abandoned:
 *   Backend terminal state is authoritative.
 *   Clear the exact durable fence and start fresh.
 *
 * Ambiguous recovery/abandon:
 *   Keep the local fence and fail closed.
 */

export function
createOfflineRevivalStartCoordinator({
  storage,
  startSession,
  recoverSession,
  abandonSession,
}) {
  if (
    typeof startSession !==
      "function" ||
    typeof recoverSession !==
      "function" ||
    typeof abandonSession !==
      "function"
  ) {
    fail(
      "OFFLINE_REVIVAL_START_CONFIG_INVALID",
      "Thiếu dịch vụ phiên chơi"
    );
  }

  let busy = false;

  async function begin({
    userId,
    gameKey,
  }) {
    if (busy) {
      return {
        status: "busy",
      };
    }

    busy = true;

    try {
      const identity = {
        userId,
        gameKey,
        storage,
      };

      let previous =
        readOfflineRevivalStartIntent(
          identity
        );

      if (previous) {
        let recovered = null;

        try {
          recovered =
            await recoverSession({
              requestId:
                previous.request_id,
            });
        } catch (error) {
          const definitiveMissing =
            error?.response?.status ===
              404 &&
            error?.response?.data
              ?.code ===
              "REVIVAL_SESSION_NOT_FOUND";

          if (!definitiveMissing) {
            throw error;
          }

          /*
           * If an authorized session is
           * definitively absent on backend,
           * its local fence is stale.
           *
           * A start_pending fence remains so
           * its exact request ID can replay.
           */
          if (
            previous.status ===
              "authorized"
          ) {
            clearOfflineRevivalStartIntent({
              ...identity,
              requestId:
                previous.request_id,
            });

            previous = null;
          }
        }

        if (recovered) {
          validateSession(
            recovered,
            previous.request_id,
            gameKey
          );

          if (
            previous.status ===
              "start_pending" &&
            recovered.session_status ===
              "active"
          ) {
            const authorized =
              authorizeOfflineRevivalStartIntent({
                ...identity,
                requestId:
                  previous.request_id,
                sessionId:
                  recovered.session_id,
              });

            return {
              status: "ready",
              request_id:
                authorized.request_id,
              session_id:
                authorized.session_id,
              recovered: true,
              session: {
                ...recovered,
                applied: true,
              },
            };
          }

          if (
            recovered.session_status ===
              "active" ||
            recovered.session_status ===
              "revive_pending"
          ) {
            const abandonment =
              await abandonSession({
                sessionId:
                  recovered.session_id,
                requestId:
                  previous.request_id,
                expectedEventSeq:
                  recovered.event_seq,
              });

            validateAbandon(
              abandonment,
              recovered.session_id,
              recovered.event_seq
            );
          } else if (
            recovered.session_status !==
              "finalized" &&
            recovered.session_status !==
              "abandoned"
          ) {
            fail(
              "OFFLINE_REVIVAL_RECOVERY_STATE_INVALID",
              "Trạng thái phiên cũ không hợp lệ"
            );
          }

          clearOfflineRevivalStartIntent({
            ...identity,
            requestId:
              previous.request_id,
          });

          previous = null;
        }
      }

      /*
       * If start_pending recovery produced a
       * definitive 404, ensure() returns the
       * SAME request ID.
       *
       * Otherwise this creates one new durable
       * free-start request.
       */
      const intent =
        ensureOfflineRevivalStartIntent(
          identity
        );

      const session =
        await startSession({
          requestId:
            intent.request_id,
          gameKey,
        });

      validateSession(
        session,
        intent.request_id,
        gameKey
      );

      if (
        session.applied !== true ||
        session.session_status !==
          "active"
      ) {
        return {
          status:
            "existing_session",
          request_id:
            intent.request_id,
          session_id:
            session.session_id,
          session_status:
            session.session_status,
        };
      }

      const authorized =
        authorizeOfflineRevivalStartIntent({
          ...identity,
          requestId:
            intent.request_id,
          sessionId:
            session.session_id,
        });

      return {
        status: "ready",
        request_id:
          authorized.request_id,
        session_id:
          authorized.session_id,
        recovered: false,
        session,
      };
    } finally {
      busy = false;
    }
  }

  return {
    begin,
  };
}
