import apiClient from
  "../../../infra/api/apiClient.js";

import {
  getCanonicalAccessToken,
} from
  "../../../infra/auth/persistedAuthSession.js";

import {
  ENGINE_VERSION,
  RULES_VERSION,
  SCORE_VERSION,
  createReplayTranscript,
  validateReplayTranscript,
} from "../engine/index.js";

const GAME_PATH =
  "/game/cing-block-puzzle";

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SHA256 =
  /^[0-9a-f]{64}$/;

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

function requireAccessToken() {
  const token =
    String(
      getCanonicalAccessToken() ||
      ""
    ).trim();

  if (!token) {
    fail(
      "BLOCK_PUZZLE_AUTH_REQUIRED",
      "Phiên đăng nhập không hợp lệ"
    );
  }

  return token;
}

function authConfig() {
  const token =
    requireAccessToken();

  return {
    headers: {
      Authorization:
        `Bearer ${token}`,
    },
  };
}

function unwrapResponse(
  response
) {
  const outer =
    response?.data;

  if (
    outer &&
    typeof outer === "object" &&
    outer.success === false
  ) {
    fail(
      outer.code ||
        "BLOCK_PUZZLE_AUTHORITY_REJECTED",

      outer.message ||
        "Block Puzzle authority rejected request"
    );
  }

  return (
    outer?.data ??
    outer
  );
}

function assertSafeInteger(
  value,
  label,
  min = 0
) {
  if (
    !Number.isSafeInteger(
      value
    ) ||
    value < min
  ) {
    fail(
      "BLOCK_PUZZLE_AUTHORITY_RESPONSE_INVALID",
      `${label} không hợp lệ`
    );
  }
}

function localReplayVersion(
  seed
) {
  return (
    createReplayTranscript(
      seed
    ).replayVersion
  );
}

export function
normalizeAuthorizedSession(
  raw
) {
  if (
    !raw ||
    typeof raw !== "object" ||
    Array.isArray(raw)
  ) {
    fail(
      "BLOCK_PUZZLE_SESSION_RESPONSE_INVALID",
      "Session authority response không hợp lệ"
    );
  }

  const sessionId =
    String(
      raw.session_id || ""
    ).trim();

  if (
    !UUID_V4.test(
      sessionId
    )
  ) {
    fail(
      "BLOCK_PUZZLE_SESSION_RESPONSE_INVALID",
      "session_id không hợp lệ"
    );
  }

  assertSafeInteger(
    raw.seed,
    "seed",
    1
  );

  if (
    raw.seed >
    0xffffffff
  ) {
    fail(
      "BLOCK_PUZZLE_SESSION_RESPONSE_INVALID",
      "seed vượt miền uint32"
    );
  }

  assertSafeInteger(
    raw.engine_version,
    "engine_version",
    1
  );

  assertSafeInteger(
    raw.rules_version,
    "rules_version",
    1
  );

  assertSafeInteger(
    raw.score_version,
    "score_version",
    1
  );

  assertSafeInteger(
    raw.replay_version,
    "replay_version",
    1
  );

  assertSafeInteger(
    raw.play_cost,
    "play_cost",
    1
  );

  if (
    raw.engine_version !==
      ENGINE_VERSION ||
    raw.rules_version !==
      RULES_VERSION ||
    raw.score_version !==
      SCORE_VERSION ||
    raw.replay_version !==
      localReplayVersion(
        raw.seed
      )
  ) {
    fail(
      "BLOCK_PUZZLE_SESSION_VERSION_MISMATCH",
      "Phiên chơi không tương thích với engine hiện tại"
    );
  }

  if (
    raw.play_cost !== 1
  ) {
    fail(
      "BLOCK_PUZZLE_SESSION_ECONOMY_MISMATCH",
      "Chi phí lượt chơi không hợp lệ"
    );
  }

  const expiresAt =
    String(
      raw.expires_at || ""
    ).trim();

  const expiryMs =
    Date.parse(
      expiresAt
    );

  if (
    !Number.isFinite(
      expiryMs
    )
  ) {
    fail(
      "BLOCK_PUZZLE_SESSION_RESPONSE_INVALID",
      "expires_at không hợp lệ"
    );
  }

  return Object.freeze({
    session_id:
      sessionId,

    seed:
      raw.seed,

    engine_version:
      raw.engine_version,

    rules_version:
      raw.rules_version,

    score_version:
      raw.score_version,

    replay_version:
      raw.replay_version,

    play_cost:
      raw.play_cost,

    expires_at:
      expiresAt,
  });
}

export function
normalizeAuthoritativeSubmission(
  raw,
  expectedSessionId
) {
  if (
    !raw ||
    typeof raw !== "object" ||
    Array.isArray(raw)
  ) {
    fail(
      "BLOCK_PUZZLE_SUBMIT_RESPONSE_INVALID",
      "Submit authority response không hợp lệ"
    );
  }

  const sessionId =
    String(
      raw.session_id || ""
    ).trim();

  if (
    !UUID_V4.test(
      sessionId
    ) ||
    sessionId !==
      expectedSessionId
  ) {
    fail(
      "BLOCK_PUZZLE_SUBMIT_RESPONSE_INVALID",
      "Submit authority session mismatch"
    );
  }

  const scoreId =
    String(
      raw.score_id ?? ""
    ).trim();

  if (!scoreId) {
    fail(
      "BLOCK_PUZZLE_SUBMIT_RESPONSE_INVALID",
      "score_id không hợp lệ"
    );
  }

  assertSafeInteger(
    raw.verified_score,
    "verified_score",
    0
  );

  assertSafeInteger(
    raw.move_count,
    "move_count",
    1
  );

  const fingerprint =
    String(
      raw.replay_fingerprint ||
      ""
    ).trim();

  if (
    !SHA256.test(
      fingerprint
    )
  ) {
    fail(
      "BLOCK_PUZZLE_SUBMIT_RESPONSE_INVALID",
      "replay_fingerprint không hợp lệ"
    );
  }

  const submittedAt =
    String(
      raw.submitted_at || ""
    ).trim();

  if (
    !Number.isFinite(
      Date.parse(
        submittedAt
      )
    )
  ) {
    fail(
      "BLOCK_PUZZLE_SUBMIT_RESPONSE_INVALID",
      "submitted_at không hợp lệ"
    );
  }

  if (
    typeof raw.idempotent !==
      "boolean"
  ) {
    fail(
      "BLOCK_PUZZLE_SUBMIT_RESPONSE_INVALID",
      "idempotent không hợp lệ"
    );
  }

  return Object.freeze({
    session_id:
      sessionId,

    score_id:
      scoreId,

    verified_score:
      raw.verified_score,

    replay_fingerprint:
      fingerprint,

    move_count:
      raw.move_count,

    submitted_at:
      submittedAt,

    idempotent:
      raw.idempotent,
  });
}

export function
createBlockPuzzleRequestId() {
  if (
    typeof globalThis.crypto
      ?.randomUUID !==
    "function"
  ) {
    fail(
      "BLOCK_PUZZLE_REQUEST_ID_UNAVAILABLE",
      "Không thể tạo request_id an toàn"
    );
  }

  return (
    globalThis.crypto
      .randomUUID()
  );
}

export async function
startAuthorizedBlockPuzzleSession({
  requestId,
}) {
  const normalizedRequestId =
    String(
      requestId || ""
    ).trim();

  if (
    !UUID_V4.test(
      normalizedRequestId
    )
  ) {
    fail(
      "BLOCK_PUZZLE_REQUEST_ID_INVALID",
      "request_id không hợp lệ"
    );
  }

  const response =
    await apiClient.post(
      `${GAME_PATH}/session`,

      {
        request_id:
          normalizedRequestId,
      },

      authConfig()
    );

  return (
    normalizeAuthorizedSession(
      unwrapResponse(
        response
      )
    )
  );
}

export async function
submitAuthorizedBlockPuzzleReplay({
  sessionId,
  replay,
}) {
  const normalizedSessionId =
    String(
      sessionId || ""
    ).trim();

  if (
    !UUID_V4.test(
      normalizedSessionId
    )
  ) {
    fail(
      "BLOCK_PUZZLE_SESSION_ID_INVALID",
      "session_id không hợp lệ"
    );
  }

  validateReplayTranscript(
    replay
  );

  const response =
    await apiClient.post(
      `${GAME_PATH}/session/${normalizedSessionId}/submit`,

      {
        replay,
      },

      authConfig()
    );

  return (
    normalizeAuthoritativeSubmission(
      unwrapResponse(
        response
      ),
      normalizedSessionId
    )
  );
}
