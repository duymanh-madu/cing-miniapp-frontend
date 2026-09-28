import {
  createBlockPuzzleSecureUuidV4,
} from "../cing-block-puzzle/runtime/blockPuzzleWebviewCompatibility.js";

const STORAGE_PREFIX =
  "cing:offline-revival:start-intent:v1:";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const GAMES = new Set([
  "cing-stack-tower",
  "black-pearl-rush",
]);

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

function normalizeIdentity(userId, gameKey) {
  const owner =
    typeof userId === "string"
      ? userId.trim()
      : "";

  if (!/^0[0-9]{8,10}$/.test(owner)) {
    fail(
      "OFFLINE_REVIVAL_OWNER_REQUIRED",
      "Không xác định được thành viên"
    );
  }

  if (!GAMES.has(gameKey)) {
    fail(
      "OFFLINE_REVIVAL_GAME_NOT_SUPPORTED",
      "Trò chơi không hợp lệ"
    );
  }

  return {
    userId: owner,
    gameKey,
  };
}

function requireStorage(storage) {
  const target =
    storage === undefined
      ? globalThis.localStorage
      : storage;

  if (
    !target ||
    typeof target.getItem !== "function" ||
    typeof target.setItem !== "function" ||
    typeof target.removeItem !== "function"
  ) {
    fail(
      "OFFLINE_REVIVAL_STORAGE_UNAVAILABLE",
      "Không thể lưu phiên chơi an toàn"
    );
  }

  return target;
}

function keyFor(gameKey) {
  return STORAGE_PREFIX + gameKey;
}

function parseIntent(raw, identity) {
  if (raw === null) {
    return null;
  }

  let data;

  try {
    data = JSON.parse(raw);
  } catch {
    fail(
      "OFFLINE_REVIVAL_INTENT_CORRUPTED",
      "Dữ liệu phiên chơi không hợp lệ"
    );
  }

  if (
    !data ||
    data.version !== 1 ||
    data.user_id !== identity.userId ||
    data.game_key !== identity.gameKey ||
    typeof data.request_id !== "string" ||
    !UUID_PATTERN.test(data.request_id) ||
    !(
      data.session_id === null ||
      (
        typeof data.session_id === "string" &&
        UUID_PATTERN.test(data.session_id)
      )
    )
  ) {
    fail(
      "OFFLINE_REVIVAL_INTENT_CONFLICT",
      "Phiên chơi hiện tại không khớp tài khoản"
    );
  }

  if (
    data.status !== "start_pending" &&
    data.status !== "authorized"
  ) {
    fail(
      "OFFLINE_REVIVAL_INTENT_CORRUPTED",
      "Trạng thái phiên chơi không hợp lệ"
    );
  }

  if (
    (data.status === "start_pending" &&
      data.session_id !== null) ||
    (data.status === "authorized" &&
      data.session_id === null)
  ) {
    fail(
      "OFFLINE_REVIVAL_INTENT_CORRUPTED",
      "Định danh phiên chơi không hợp lệ"
    );
  }

  return data;
}

function readRaw(storage, key) {
  try {
    return storage.getItem(key);
  } catch {
    fail(
      "OFFLINE_REVIVAL_STORAGE_UNAVAILABLE",
      "Không thể đọc phiên chơi an toàn"
    );
  }
}

function write(storage, key, data) {
  const serialized = JSON.stringify(data);

  try {
    storage.setItem(key, serialized);

    if (storage.getItem(key) !== serialized) {
      throw new Error("Persistence verification failed");
    }
  } catch {
    fail(
      "OFFLINE_REVIVAL_STORAGE_UNAVAILABLE",
      "Không thể lưu phiên chơi an toàn"
    );
  }

  return data;
}

/*
 * The intent is account-bound.
 *
 * A different logged-in member must not
 * inherit or overwrite another member's
 * unresolved start request.
 */
export function readOfflineRevivalStartIntent({
  userId,
  gameKey,
  storage,
}) {
  const identity =
    normalizeIdentity(userId, gameKey);

  const target =
    requireStorage(storage);

  return parseIntent(
    readRaw(target, keyFor(gameKey)),
    identity
  );
}

/*
 * Must run BEFORE POST /session.
 *
 * An existing unresolved request keeps
 * its original request_id, including after
 * a network error or WebView reload.
 */
export function ensureOfflineRevivalStartIntent({
  userId,
  gameKey,
  storage,
}) {
  const identity =
    normalizeIdentity(userId, gameKey);

  const target =
    requireStorage(storage);

  const key =
    keyFor(gameKey);

  const existing =
    parseIntent(
      readRaw(target, key),
      identity
    );

  if (existing) {
    return existing;
  }

  const intent = {
    version: 1,
    user_id: identity.userId,
    game_key: identity.gameKey,
    request_id:
      createBlockPuzzleSecureUuidV4(),
    session_id: null,
    status: "start_pending",
  };

  return write(target, key, intent);
}

/*
 * Persist the authoritative PostgreSQL
 * session identity before enabling gameplay.
 */
export function authorizeOfflineRevivalStartIntent({
  userId,
  gameKey,
  requestId,
  sessionId,
  storage,
}) {
  const identity =
    normalizeIdentity(userId, gameKey);

  const target =
    requireStorage(storage);

  const key =
    keyFor(gameKey);

  const existing =
    parseIntent(
      readRaw(target, key),
      identity
    );

  if (
    !existing ||
    existing.request_id !== requestId ||
    typeof sessionId !== "string" ||
    !UUID_PATTERN.test(sessionId)
  ) {
    fail(
      "OFFLINE_REVIVAL_START_MISMATCH",
      "Không thể xác minh phiên chơi"
    );
  }

  if (
    existing.session_id !== null &&
    existing.session_id !== sessionId
  ) {
    fail(
      "OFFLINE_REVIVAL_START_MISMATCH",
      "Phiên chơi đã có định danh khác"
    );
  }

  const authorized = {
    ...existing,
    session_id: sessionId,
    status: "authorized",
  };

  return write(
    target,
    key,
    authorized
  );
}

/*
 * The caller must clear only after a
 * definitive lifecycle resolution.
 *
 * Ambiguous network failures must NEVER
 * trigger automatic intent deletion.
 */
export function clearOfflineRevivalStartIntent({
  userId,
  gameKey,
  requestId,
  storage,
}) {
  const identity =
    normalizeIdentity(userId, gameKey);

  const target =
    requireStorage(storage);

  const key =
    keyFor(gameKey);

  const existing =
    parseIntent(
      readRaw(target, key),
      identity
    );

  if (!existing) {
    return false;
  }

  if (
    existing.request_id !== requestId
  ) {
    fail(
      "OFFLINE_REVIVAL_CLEAR_MISMATCH",
      "Không thể xóa phiên chơi khác"
    );
  }

  try {
    target.removeItem(key);

    if (target.getItem(key) !== null) {
      throw new Error("Removal verification failed");
    }
  } catch {
    fail(
      "OFFLINE_REVIVAL_STORAGE_UNAVAILABLE",
      "Không thể kết thúc lưu trữ phiên chơi"
    );
  }

  return true;
}
