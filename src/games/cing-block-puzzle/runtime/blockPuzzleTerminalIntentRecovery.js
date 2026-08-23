const STORAGE_VERSION = 1;

const STORAGE_KEY =
  "cing_block_puzzle_terminal_intent_v1";

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ACTIONS =
  new Set([
    "offer",
    "continue_pending",
    "submit_pending",
  ]);

function normalizeOwnerKey(
  value
) {
  const normalized =
    String(value || "")
      .replace(/\D/g, "")
      .replace(/^84/, "0");

  if (
    normalized.length < 9
  ) {
    throw new Error(
      "Block Puzzle terminal owner invalid"
    );
  }

  return normalized;
}

function normalizeIntent(
  value,
  expectedOwnerKey,
  expectedSessionId = null
) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new Error(
      "Block Puzzle terminal intent invalid"
    );
  }

  const expectedKeys = [
    "storage_version",
    "owner_key",
    "session_id",
    "action",
    "request_id",
    "continue_index",
  ].sort();

  const actualKeys =
    Object.keys(value).sort();

  if (
    actualKeys.length !==
      expectedKeys.length ||
    actualKeys.some(
      (key, index) =>
        key !== expectedKeys[index]
    )
  ) {
    throw new Error(
      "Block Puzzle terminal intent fields invalid"
    );
  }

  if (
    value.storage_version !==
      STORAGE_VERSION
  ) {
    throw new Error(
      "Block Puzzle terminal intent version invalid"
    );
  }

  const ownerKey =
    normalizeOwnerKey(
      value.owner_key
    );

  if (
    ownerKey !==
      normalizeOwnerKey(
        expectedOwnerKey
      )
  ) {
    throw new Error(
      "Block Puzzle terminal intent owner mismatch"
    );
  }

  const sessionId =
    String(
      value.session_id || ""
    ).trim();

  if (
    !UUID_V4.test(
      sessionId
    ) ||
    (
      expectedSessionId &&
      sessionId !==
        expectedSessionId
    )
  ) {
    throw new Error(
      "Block Puzzle terminal intent session invalid"
    );
  }

  const action =
    String(
      value.action || ""
    );

  if (
    !ACTIONS.has(
      action
    )
  ) {
    throw new Error(
      "Block Puzzle terminal intent action invalid"
    );
  }

  let requestId = null;
  let continueIndex = null;

  if (
    action ===
      "continue_pending"
  ) {
    requestId =
      String(
        value.request_id || ""
      ).trim();

    continueIndex =
      Number(
        value.continue_index
      );

    if (
      !UUID_V4.test(
        requestId
      ) ||
      !Number.isSafeInteger(
        continueIndex
      ) ||
      continueIndex < 1 ||
      continueIndex > 3
    ) {
      throw new Error(
        "Block Puzzle pending continue intent invalid"
      );
    }
  } else if (
    value.request_id !== null ||
    value.continue_index !== null
  ) {
    throw new Error(
      "Block Puzzle terminal intent payload invalid"
    );
  }

  return Object.freeze({
    storage_version:
      STORAGE_VERSION,

    owner_key:
      ownerKey,

    session_id:
      sessionId,

    action,

    request_id:
      requestId,

    continue_index:
      continueIndex,
  });
}

function resolveStorage(
  storage
) {
  if (storage) {
    return storage;
  }

  return (
    globalThis.localStorage ??
    null
  );
}

export function
persistBlockPuzzleTerminalIntent({
  ownerKey,
  sessionId,
  action,
  requestId = null,
  continueIndex = null,
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
    const intent =
      normalizeIntent(
        {
          storage_version:
            STORAGE_VERSION,

          owner_key:
            ownerKey,

          session_id:
            sessionId,

          action,

          request_id:
            requestId,

          continue_index:
            continueIndex,
        },
        ownerKey,
        sessionId
      );

    target.setItem(
      STORAGE_KEY,
      JSON.stringify(
        intent
      )
    );

    return true;
  } catch {
    return false;
  }
}

export function
restoreBlockPuzzleTerminalIntent({
  ownerKey,
  sessionId,
  storage,
}) {
  const target =
    resolveStorage(
      storage
    );

  if (!target) {
    return null;
  }

  try {
    const raw =
      target.getItem(
        STORAGE_KEY
      );

    if (!raw) {
      return null;
    }

    return normalizeIntent(
      JSON.parse(raw),
      ownerKey,
      sessionId
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
clearBlockPuzzleTerminalIntent({
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
