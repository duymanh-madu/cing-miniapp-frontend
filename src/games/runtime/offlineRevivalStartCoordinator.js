import {
  readOfflineRevivalStartIntent,
  ensureOfflineRevivalStartIntent,
  authorizeOfflineRevivalStartIntent,
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
    )
  ) {
    fail(
      "OFFLINE_REVIVAL_START_RESPONSE_INVALID",
      "Không thể xác minh phiên chơi"
    );
  }

  return result;
}

/*
 * Dependency injection keeps this coordinator
 * independent of HTTP, React and Vite aliases.
 *
 * The application supplies the authenticated
 * start and recovery API operations.
 */
export function createOfflineRevivalStartCoordinator({
  storage,
  startSession,
  recoverSession,
}) {
  if (
    typeof startSession !== "function" ||
    typeof recoverSession !== "function"
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
    /*
     * Synchronous fence: two taps cannot
     * launch two concurrent HTTP starts.
     */
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

      const previous =
        readOfflineRevivalStartIntent(
          identity
        );

      /*
       * Canvas gameplay is not reconstructible
       * from the session ID alone.
       *
       * Do not silently replay an already
       * authorized session as a new round.
       */
      if (
        previous?.status === "authorized"
      ) {
        return {
          status: "existing_session",
          request_id:
            previous.request_id,
          session_id:
            previous.session_id,
        };
      }

      /*
       * ensure() durably writes request_id
       * before any business POST can occur.
       */
      const intent =
        ensureOfflineRevivalStartIntent(
          identity
        );

      let session = null;
      let recovered = false;

      if (previous) {
        /*
         * Recover an unresolved POST first.
         *
         * Only definitive NOT_FOUND permits
         * retrying POST with the SAME ID.
         *
         * Network errors, 401 failures and
         * unknown 404 responses propagate.
         */
        try {
          session =
            await recoverSession({
              requestId:
                intent.request_id,
            });

          recovered = true;
        } catch (error) {
          if (
            error?.response?.status !== 404 ||
            error?.response?.data?.code !==
              "REVIVAL_SESSION_NOT_FOUND"
          ) {
            throw error;
          }
        }
      }

      if (!session && !recovered) {
        session =
          await startSession({
            requestId:
              intent.request_id,
            gameKey,
          });
      }

      validateSession(
        session,
        intent.request_id,
        gameKey
      );

      /*
       * The paid-start RPC owns this flag:
       *
       * applied=true  => newly created paid session
       * applied=false => durable replay / existing session
       *
       * GET recovery never grants new-play authority.
       */
      const isFreshPaidStart =
        !recovered &&
        session.applied === true;

      const authorized =
        authorizeOfflineRevivalStartIntent({
          ...identity,
          requestId:
            intent.request_id,
          sessionId:
            session.session_id,
        });

      /*
       * A previously persisted start may
       * already have reached pending or
       * finalized while the client was away.
       */
      if (
        !isFreshPaidStart ||
        session.session_status !== "active"
      ) {
        return {
          status: "existing_session",
          request_id:
            authorized.request_id,
          session_id:
            authorized.session_id,
          session_status:
            session.session_status,
        };
      }

      return {
        status: "ready",
        request_id:
          authorized.request_id,
        session_id:
          authorized.session_id,
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
