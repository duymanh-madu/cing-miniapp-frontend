import apiClient from
  "../../infra/api/apiClient.js";

import {
  recoverBackendAuthSession,
} from
  "../../infra/auth/authRecovery.js";

import {
  getCanonicalAccessToken,
} from
  "../../infra/auth/persistedAuthSession.js";

import {
  createBlockPuzzleSecureUuidV4,
} from
  "../cing-block-puzzle/runtime/blockPuzzleWebviewCompatibility.js";

const GAME_PATH =
  "/game/offline-revival";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const GAME_KEYS = new Set([
  "cing-block-puzzle",
  "cing-stack-tower",
  "black-pearl-rush",
]);

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

function requireUuid(value, field) {
  if (
    typeof value !== "string" ||
    !UUID_PATTERN.test(value.trim())
  ) {
    fail(
      "OFFLINE_REVIVAL_INVALID_UUID",
      `${field} không hợp lệ`
    );
  }

  return value.trim().toLowerCase();
}

function requireGameKey(value) {
  if (!GAME_KEYS.has(value)) {
    fail(
      "OFFLINE_REVIVAL_GAME_NOT_SUPPORTED",
      "Trò chơi không hỗ trợ phiên hồi sinh này"
    );
  }

  return value;
}

function requireSequence(value, minimum) {
  if (
    !Number.isInteger(value) ||
    value < minimum ||
    value >= 2147483647
  ) {
    fail(
      "OFFLINE_REVIVAL_INVALID_SEQUENCE",
      "event_seq không hợp lệ"
    );
  }

  return value;
}

function requireEventId(value) {
  const decimal =
    typeof value === "string"
      ? value
      : (
          typeof value === "number" &&
          Number.isSafeInteger(value)
        )
        ? String(value)
        : "";

  if (
    !/^[1-9][0-9]*$/.test(decimal) ||
    BigInt(decimal) >
      9223372036854775807n
  ) {
    fail(
      "OFFLINE_REVIVAL_INVALID_EVENT_ID",
      "pending_event_id không hợp lệ"
    );
  }

  return decimal;
}

function requireResultInteger(value, name) {
  if (
    !Number.isSafeInteger(value) ||
    value < 0 ||
    value > 2147483647
  ) {
    fail(
      "OFFLINE_REVIVAL_INVALID_RESULT",
      `${name} không hợp lệ`
    );
  }

  return value;
}

function authConfig() {
  const token = String(
    getCanonicalAccessToken() || ""
  ).trim();

  if (!token) {
    fail(
      "OFFLINE_REVIVAL_AUTH_REQUIRED",
      "Phiên đăng nhập không hợp lệ"
    );
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

/*
 * Retry exactly once after HTTP 401.
 *
 * The operation closure retains the original
 * request_id, session_id and event_seq.
 *
 * Never silently retry a mutation after a
 * timeout or an unknown network failure:
 * the transaction may already have committed.
 */
async function requestWithAuthRecovery(operation) {
  try {
    return await operation(authConfig());
  } catch (error) {
    if (
      Number(error?.response?.status || 0) !== 401
    ) {
      throw error;
    }

    await recoverBackendAuthSession();

    return operation(authConfig());
  }
}

function unwrapResponse(response) {
  const outer = response?.data;

  if (
    !outer ||
    outer.success !== true ||
    !outer.data ||
    typeof outer.data !== "object" ||
    Array.isArray(outer.data)
  ) {
    fail(
      "OFFLINE_REVIVAL_INVALID_RESPONSE",
      "Phản hồi phiên chơi không hợp lệ"
    );
  }

  return outer.data;
}

function post(path, payload) {
  return requestWithAuthRecovery(
    (config) =>
      apiClient.post(
        GAME_PATH + path,
        payload,
        config
      )
  ).then(unwrapResponse);
}

function get(path) {
  return requestWithAuthRecovery(
    (config) =>
      apiClient.get(
        GAME_PATH + path,
        config
      )
  ).then(unwrapResponse);
}

/*
 * The caller creates a request ID ONCE when
 * initiating a business action, then retains
 * it for retries and recovery.
 *
 * This helper does not silently create a
 * replacement request ID inside post().
 */
export function
createOfflineRevivalRequestId() {
  return createBlockPuzzleSecureUuidV4();
}

export function
startOfflineRevivalSession({
  requestId,
  gameKey,
}) {
  const payload = {
    request_id:
      requireUuid(requestId, "request_id"),

    game_key:
      requireGameKey(gameKey),
  };

  return post("/session", payload);
}

export function
markOfflineRevivalPending({
  sessionId,
  requestId,
  expectedEventSeq,
  reason,
}) {
  if (
    reason !== "timeout" &&
    reason !== "death"
  ) {
    fail(
      "OFFLINE_REVIVAL_INVALID_REASON",
      "Nguyên nhân kết thúc lượt không hợp lệ"
    );
  }

  const payload = {
    request_id:
      requireUuid(requestId, "request_id"),

    expected_event_seq:
      requireSequence(expectedEventSeq, 0),

    reason,
  };

  return post(
    "/session/" +
      requireUuid(sessionId, "session_id") +
      "/pending",
    payload
  );
}

export function
purchaseOfflineRevival({
  sessionId,
  requestId,
  expectedEventSeq,
  pendingEventId,
}) {
  const payload = {
    request_id:
      requireUuid(requestId, "request_id"),

    expected_event_seq:
      requireSequence(expectedEventSeq, 1),

    pending_event_id:
      requireEventId(pendingEventId),
  };

  return post(
    "/session/" +
      requireUuid(sessionId, "session_id") +
      "/revive",
    payload
  );
}

export function
finalizeOfflineRevivalSession({
  sessionId,
  requestId,
  expectedEventSeq,
  finalScore,
  finalBestCombo,
  playerName,
  avatar,
}) {
  const payload = {
    request_id:
      requireUuid(requestId, "request_id"),

    expected_event_seq:
      requireSequence(expectedEventSeq, 1),

    final_score:
      requireResultInteger(
        finalScore,
        "final_score"
      ),

    final_best_combo:
      requireResultInteger(
        finalBestCombo,
        "final_best_combo"
      ),

    player_name:
      typeof playerName === "string"
        ? playerName
        : "",

    avatar:
      typeof avatar === "string"
        ? avatar
        : "",
  };

  return post(
    "/session/" +
      requireUuid(sessionId, "session_id") +
      "/finalize",
    payload
  );
}

export function
getOfflineRevivalCreditBalance() {
  return get("/balance");
}

export function
recoverOfflineRevivalSession({
  requestId,
}) {
  return get(
    "/session/recover/" +
    requireUuid(requestId, "request_id")
  );
}
