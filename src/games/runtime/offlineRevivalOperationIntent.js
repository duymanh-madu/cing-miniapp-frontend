const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const EVENT_ID =
  /^[1-9][0-9]*$/;

const GAME_KEYS = new Set([
  "cing-block-puzzle",
  "cing-stack-tower",
  "black-pearl-rush",
]);

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

function identity(input) {
  if (
    !input ||
    typeof input.userId !== "string" ||
    !input.userId.trim() ||
    !GAME_KEYS.has(input.gameKey) ||
    typeof input.sessionId !== "string" ||
    !UUID.test(input.sessionId)
  ) {
    fail("REVIVAL_INTENT_IDENTITY_INVALID");
  }

  return {
    user_id: input.userId.trim(),
    game_key: input.gameKey,
    session_id: input.sessionId.toLowerCase(),
  };
}

function getStorage(input) {
  const storage = input?.storage;

  if (
    !storage ||
    typeof storage.getItem !== "function" ||
    typeof storage.setItem !== "function" ||
    typeof storage.removeItem !== "function"
  ) {
    fail("REVIVAL_INTENT_STORAGE_INVALID");
  }

  return storage;
}

function storageKey(gameKey) {
  if (!GAME_KEYS.has(gameKey)) {
    fail("REVIVAL_INTENT_GAME_INVALID");
  }

  return `cing_revive_operation_v1:${gameKey}`;
}

function validate(record) {
  if (
    !record ||
    typeof record !== "object" ||
    record.version !== 1 ||
    typeof record.user_id !== "string" ||
    !record.user_id ||
    !GAME_KEYS.has(record.game_key) ||
    typeof record.session_id !== "string" ||
    !UUID.test(record.session_id) ||
    typeof record.request_id !== "string" ||
    !UUID.test(record.request_id) ||
    !Number.isInteger(record.expected_event_seq) ||
    record.expected_event_seq < 0 ||
    record.expected_event_seq >= 2147483647 ||
    !["pending", "revive"].includes(record.operation)
  ) {
    fail("REVIVAL_INTENT_CORRUPTED");
  }

  if (record.operation === "pending") {
    if (
      !["death", "timeout"].includes(record.reason) ||
      record.pending_event_id !== null
    ) {
      fail("REVIVAL_INTENT_CORRUPTED");
    }
  } else {
    if (
      record.reason !== null ||
      record.expected_event_seq < 1 ||
      typeof record.pending_event_id !== "string" ||
      !EVENT_ID.test(record.pending_event_id) ||
      BigInt(record.pending_event_id) >
        9223372036854775807n
    ) {
      fail("REVIVAL_INTENT_CORRUPTED");
    }
  }

  return record;
}

function assertOwner(record, owner) {
  if (
    record.user_id !== owner.user_id ||
    record.game_key !== owner.game_key ||
    record.session_id !== owner.session_id
  ) {
    fail("REVIVAL_INTENT_OWNER_CONFLICT");
  }
}

function readRaw(storage, key) {
  let raw;

  try {
    raw = storage.getItem(key);
  } catch {
    fail("REVIVAL_INTENT_STORAGE_FAILED");
  }

  if (raw === null) return null;

  try {
    return validate(JSON.parse(raw));
  } catch (error) {
    if (
      error?.code === "REVIVAL_INTENT_CORRUPTED"
    ) {
      throw error;
    }

    fail("REVIVAL_INTENT_CORRUPTED");
  }
}

export function readOfflineRevivalOperationIntent(input) {
  const owner = identity(input);
  const storage = getStorage(input);

  const record = readRaw(
    storage,
    storageKey(owner.game_key)
  );

  if (!record) return null;

  assertOwner(record, owner);

  return Object.freeze({ ...record });
}

export function ensureOfflineRevivalOperationIntent(input) {
  const owner = identity(input);
  const storage = getStorage(input);
  const key = storageKey(owner.game_key);

  const existing = readRaw(storage, key);

  const expected = {
    operation: input.operation,
    expected_event_seq: input.expectedEventSeq,
    reason:
      input.operation === "pending"
        ? input.reason
        : null,
    pending_event_id:
      input.operation === "revive"
        ? String(input.pendingEventId ?? "")
        : null,
  };

  if (existing) {
    assertOwner(existing, owner);

    if (
      existing.operation !== expected.operation ||
      existing.expected_event_seq !==
        expected.expected_event_seq ||
      existing.reason !== expected.reason ||
      existing.pending_event_id !==
        expected.pending_event_id
    ) {
      fail("REVIVAL_INTENT_OPERATION_CONFLICT");
    }

    return Object.freeze({ ...existing });
  }

  if (typeof input.createRequestId !== "function") {
    fail("REVIVAL_INTENT_UUID_REQUIRED");
  }

  const record = validate({
    version: 1,
    ...owner,
    ...expected,
    request_id: input.createRequestId(),
  });

  try {
    storage.setItem(
      key,
      JSON.stringify(record)
    );
  } catch {
    fail("REVIVAL_INTENT_STORAGE_FAILED");
  }

  const persisted = readRaw(storage, key);

  if (
    !persisted ||
    persisted.request_id !== record.request_id ||
    persisted.user_id !== record.user_id ||
    persisted.session_id !== record.session_id ||
    persisted.operation !== record.operation
  ) {
    fail("REVIVAL_INTENT_PERSISTENCE_FAILED");
  }

  return Object.freeze({ ...persisted });
}

export function clearOfflineRevivalOperationIntent(input) {
  const owner = identity(input);
  const storage = getStorage(input);
  const key = storageKey(owner.game_key);

  const record = readRaw(storage, key);

  if (!record) {
    fail("REVIVAL_INTENT_MISSING");
  }

  assertOwner(record, owner);

  if (
    record.request_id !== input.requestId ||
    record.operation !== input.operation
  ) {
    fail("REVIVAL_INTENT_CLEAR_CONFLICT");
  }

  try {
    storage.removeItem(key);
  } catch {
    fail("REVIVAL_INTENT_STORAGE_FAILED");
  }

  if (readRaw(storage, key) !== null) {
    fail("REVIVAL_INTENT_CLEAR_FAILED");
  }

  return true;
}
