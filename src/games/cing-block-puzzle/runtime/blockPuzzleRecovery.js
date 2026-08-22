import {
  validateReplayTranscript,
} from "../engine/index.js";

const STORAGE_VERSION = 1;

const STORAGE_KEY =
  "cing_block_puzzle_recovery_v1";

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function fail(
  code,
  message
) {
  const error =
    new Error(message);

  error.code =
    code;

  throw error;
}

function normalizeOwnerKey(
  value
) {
  const normalized =
    String(
      value || ""
    )
      .replace(/\D/g, "")
      .replace(/^84/, "0");

  if (
    normalized.length < 9
  ) {
    fail(
      "BLOCK_PUZZLE_RECOVERY_OWNER_INVALID",
      "Recovery owner không hợp lệ"
    );
  }

  return normalized;
}

function normalizeRequestId(
  value
) {
  const normalized =
    String(
      value || ""
    ).trim();

  if (
    !UUID_V4.test(
      normalized
    )
  ) {
    fail(
      "BLOCK_PUZZLE_RECOVERY_REQUEST_ID_INVALID",
      "Recovery request_id không hợp lệ"
    );
  }

  return normalized;
}

function normalizeSession(
  session
) {
  if (
    !session ||
    typeof session !== "object" ||
    Array.isArray(session)
  ) {
    fail(
      "BLOCK_PUZZLE_RECOVERY_SESSION_INVALID",
      "Recovery session không hợp lệ"
    );
  }

  const requiredKeys = [
    "session_id",
    "seed",
    "engine_version",
    "rules_version",
    "score_version",
    "replay_version",
    "play_cost",
    "expires_at",
  ];

  const actual =
    Object.keys(
      session
    ).sort();

  const expected =
    [...requiredKeys].sort();

  if (
    actual.length !==
      expected.length ||
    actual.some(
      (key, index) =>
        key !== expected[index]
    )
  ) {
    fail(
      "BLOCK_PUZZLE_RECOVERY_SESSION_INVALID",
      "Recovery session fields không hợp lệ"
    );
  }

  if (
    !UUID_V4.test(
      String(
        session.session_id ||
        ""
      )
    )
  ) {
    fail(
      "BLOCK_PUZZLE_RECOVERY_SESSION_INVALID",
      "Recovery session_id không hợp lệ"
    );
  }

  if (
    !Number.isSafeInteger(
      session.seed
    ) ||
    session.seed < 1 ||
    session.seed >
      0xffffffff
  ) {
    fail(
      "BLOCK_PUZZLE_RECOVERY_SESSION_INVALID",
      "Recovery seed không hợp lệ"
    );
  }

  for (
    const key of [
      "engine_version",
      "rules_version",
      "score_version",
      "replay_version",
      "play_cost",
    ]
  ) {
    if (
      !Number.isSafeInteger(
        session[key]
      ) ||
      session[key] < 1
    ) {
      fail(
        "BLOCK_PUZZLE_RECOVERY_SESSION_INVALID",
        `Recovery ${key} không hợp lệ`
      );
    }
  }

  if (
    !Number.isFinite(
      Date.parse(
        session.expires_at
      )
    )
  ) {
    fail(
      "BLOCK_PUZZLE_RECOVERY_SESSION_INVALID",
      "Recovery expires_at không hợp lệ"
    );
  }

  return {
    ...session,
  };
}

function normalizeEnvelope(
  envelope,
  expectedOwnerKey
) {
  if (
    !envelope ||
    typeof envelope !==
      "object" ||
    Array.isArray(envelope)
  ) {
    fail(
      "BLOCK_PUZZLE_RECOVERY_INVALID",
      "Recovery envelope không hợp lệ"
    );
  }

  const actual =
    Object.keys(
      envelope
    ).sort();

  const expected = [
    "storage_version",
    "owner_key",
    "request_id",
    "session",
    "replay",
  ].sort();

  if (
    actual.length !==
      expected.length ||
    actual.some(
      (key, index) =>
        key !== expected[index]
    )
  ) {
    fail(
      "BLOCK_PUZZLE_RECOVERY_INVALID",
      "Recovery envelope fields không hợp lệ"
    );
  }

  if (
    envelope.storage_version !==
      STORAGE_VERSION
  ) {
    fail(
      "BLOCK_PUZZLE_RECOVERY_VERSION_UNSUPPORTED",
      "Recovery version không được hỗ trợ"
    );
  }

  const ownerKey =
    normalizeOwnerKey(
      envelope.owner_key
    );

  if (
    ownerKey !==
    normalizeOwnerKey(
      expectedOwnerKey
    )
  ) {
    fail(
      "BLOCK_PUZZLE_RECOVERY_OWNER_MISMATCH",
      "Recovery không thuộc tài khoản hiện tại"
    );
  }

  const requestId =
    normalizeRequestId(
      envelope.request_id
    );

  const hasSession =
    envelope.session !==
    null;

  const hasReplay =
    envelope.replay !==
    null;

  if (
    hasSession !==
    hasReplay
  ) {
    fail(
      "BLOCK_PUZZLE_RECOVERY_PAIR_INVALID",
      "Recovery session/replay không đồng bộ"
    );
  }

  if (!hasSession) {
    return Object.freeze({
      storage_version:
        STORAGE_VERSION,

      owner_key:
        ownerKey,

      request_id:
        requestId,

      session:
        null,

      replay:
        null,
    });
  }

  const session =
    normalizeSession(
      envelope.session
    );

  validateReplayTranscript(
    envelope.replay
  );

  if (
    envelope.replay.seed !==
      session.seed ||
    envelope.replay
      .engineVersion !==
      session.engine_version ||
    envelope.replay
      .rulesVersion !==
      session.rules_version ||
    envelope.replay
      .scoreVersion !==
      session.score_version ||
    envelope.replay
      .replayVersion !==
      session.replay_version
  ) {
    fail(
      "BLOCK_PUZZLE_RECOVERY_VERSION_MISMATCH",
      "Recovery replay không khớp session authority"
    );
  }

  return Object.freeze({
    storage_version:
      STORAGE_VERSION,

    owner_key:
      ownerKey,

    request_id:
      requestId,

    session:
      Object.freeze(
        session
      ),

    replay:
      structuredClone(
        envelope.replay
      ),
  });
}

function resolveStorage(
  storage
) {
  if (storage) {
    return storage;
  }

  if (
    typeof globalThis
      .localStorage ===
    "undefined"
  ) {
    return null;
  }

  return globalThis
    .localStorage;
}

export function
persistBlockPuzzlePendingStart({
  ownerKey,
  requestId,
  storage,
}) {
  const target =
    resolveStorage(
      storage
    );

  if (!target) {
    return false;
  }

  try {
    const envelope = {
      storage_version:
        STORAGE_VERSION,

      owner_key:
        normalizeOwnerKey(
          ownerKey
        ),

      request_id:
        normalizeRequestId(
          requestId
        ),

      session:
        null,

      replay:
        null,
    };

    target.setItem(
      STORAGE_KEY,
      JSON.stringify(
        envelope
      )
    );

    return true;
  } catch {
    return false;
  }
}

export function
persistBlockPuzzleRuntime({
  ownerKey,
  requestId,
  runtime,
  storage,
}) {
  const target =
    resolveStorage(
      storage
    );

  if (
    !target ||
    !runtime?.session ||
    !runtime?.replay
  ) {
    return false;
  }

  try {
    const envelope =
      normalizeEnvelope(
        {
          storage_version:
            STORAGE_VERSION,

          owner_key:
            ownerKey,

          request_id:
            requestId,

          session:
            runtime.session,

          replay:
            runtime.replay,
        },
        ownerKey
      );

    target.setItem(
      STORAGE_KEY,
      JSON.stringify(
        envelope
      )
    );

    return true;
  } catch {
    return false;
  }
}

export function
restoreBlockPuzzleRecovery({
  ownerKey,
  storage,
}) {
  const target =
    resolveStorage(
      storage
    );

  if (!target) {
    return null;
  }

  let raw;

  try {
    raw =
      target.getItem(
        STORAGE_KEY
      );
  } catch {
    return null;
  }

  if (!raw) {
    return null;
  }

  try {
    return (
      normalizeEnvelope(
        JSON.parse(raw),
        ownerKey
      )
    );
  } catch {
    try {
      target.removeItem(
        STORAGE_KEY
      );
    } catch {}

    return null;
  }
}

export function
clearBlockPuzzleRecovery({
  storage,
} = {}) {
  const target =
    resolveStorage(
      storage
    );

  if (!target) {
    return false;
  }

  try {
    target.removeItem(
      STORAGE_KEY
    );

    return true;
  } catch {
    return false;
  }
}

export function
isBlockPuzzleSessionExpired(
  session,
  now = Date.now()
) {
  if (
    !session ||
    !Number.isFinite(now)
  ) {
    return true;
  }

  const expiry =
    Date.parse(
      session.expires_at
    );

  return (
    !Number.isFinite(expiry) ||
    now >= expiry
  );
}

export const
BLOCK_PUZZLE_RECOVERY_STORAGE_VERSION =
  STORAGE_VERSION;
