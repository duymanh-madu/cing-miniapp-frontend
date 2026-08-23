import apiClient from
  "../../../infra/api/apiClient.js";

import {
  getCanonicalAccessToken,
} from
  "../../../infra/auth/persistedAuthSession.js";

import {
  getBlockPuzzleEngineForContract,
} from "./blockPuzzleEngineRegistry.js";

import {
  normalizeAuthorizedSession,
} from "./blockPuzzleAuthorityContracts.js";

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

  if (
    !replay ||
    typeof replay !== "object" ||
    Array.isArray(replay)
  ) {
    fail(
      "BLOCK_PUZZLE_REPLAY_INVALID",
      "Replay không hợp lệ"
    );
  }

  let replayEngine;

  try {
    replayEngine =
      getBlockPuzzleEngineForContract({
        engine_version:
          replay.engineVersion,

        rules_version:
          replay.rulesVersion,

        score_version:
          replay.scoreVersion,

        replay_version:
          replay.replayVersion,
      });
  } catch (error) {
    if (
      error?.code ===
      "BLOCK_PUZZLE_UNSUPPORTED_ENGINE_CONTRACT"
    ) {
      fail(
        "BLOCK_PUZZLE_REPLAY_VERSION_MISMATCH",
        "Replay không tương thích với engine hiện tại"
      );
    }

    throw error;
  }

  replayEngine.validateReplayTranscript(
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

export function
normalizeAuthoritativeContinuePurchase(
  raw,
  expectedSessionId
) {
  if (
    !raw ||
    typeof raw !== "object" ||
    Array.isArray(raw)
  ) {
    fail(
      "BLOCK_PUZZLE_CONTINUE_RESPONSE_INVALID",
      "Continue authority response không hợp lệ"
    );
  }

  const purchaseId =
    String(
      raw.purchase_id || ""
    ).trim();

  const sessionId =
    String(
      raw.session_id || ""
    ).trim();

  if (
    !UUID_V4.test(
      purchaseId
    ) ||
    !UUID_V4.test(
      sessionId
    ) ||
    sessionId !==
      expectedSessionId
  ) {
    fail(
      "BLOCK_PUZZLE_CONTINUE_RESPONSE_INVALID",
      "Continue authority identity không hợp lệ"
    );
  }

  const continueIndex =
    Number(
      raw.continue_index
    );

  const pointsCost =
    Number(
      raw.points_cost
    );

  const balanceBefore =
    Number(
      raw.balance_before
    );

  const balanceAfter =
    Number(
      raw.balance_after
    );

  const continueCount =
    Number(
      raw.continue_count
    );

  for (
    const [
      value,
      label,
      min,
    ] of [
      [
        continueIndex,
        "continue_index",
        1,
      ],
      [
        pointsCost,
        "points_cost",
        1,
      ],
      [
        balanceBefore,
        "balance_before",
        0,
      ],
      [
        balanceAfter,
        "balance_after",
        0,
      ],
      [
        continueCount,
        "continue_count",
        1,
      ],
    ]
  ) {
    assertSafeInteger(
      value,
      label,
      min
    );
  }

  const expectedCost =
    [
      0,
      5,
      10,
      20,
    ][
      continueIndex
    ];

  if (
    pointsCost !==
      expectedCost ||
    continueCount !==
      continueIndex ||
    balanceAfter !==
      balanceBefore -
        pointsCost
  ) {
    fail(
      "BLOCK_PUZZLE_CONTINUE_RESPONSE_INVALID",
      "Continue authority invariant không hợp lệ"
    );
  }

  if (
    typeof raw.idempotent !==
      "boolean"
  ) {
    fail(
      "BLOCK_PUZZLE_CONTINUE_RESPONSE_INVALID",
      "Continue idempotency flag không hợp lệ"
    );
  }

  const createdAt =
    String(
      raw.created_at || ""
    );

  if (
    !Number.isFinite(
      Date.parse(
        createdAt
      )
    )
  ) {
    fail(
      "BLOCK_PUZZLE_CONTINUE_RESPONSE_INVALID",
      "Continue created_at không hợp lệ"
    );
  }

  return Object.freeze({
    purchase_id:
      purchaseId,

    session_id:
      sessionId,

    continue_index:
      continueIndex,

    points_cost:
      pointsCost,

    balance_before:
      balanceBefore,

    balance_after:
      balanceAfter,

    continue_count:
      continueCount,

    created_at:
      createdAt,

    idempotent:
      raw.idempotent,
  });
}

export async function
purchaseAuthorizedBlockPuzzleContinue({
  sessionId,
  requestId,
  replay,
}) {
  const normalizedSessionId =
    String(
      sessionId || ""
    ).trim();

  const normalizedRequestId =
    String(
      requestId || ""
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

  if (
    !replay ||
    typeof replay !== "object" ||
    Array.isArray(replay)
  ) {
    fail(
      "BLOCK_PUZZLE_REPLAY_INVALID",
      "Replay không hợp lệ"
    );
  }

  const engine =
    getBlockPuzzleEngineForContract({
      engine_version:
        replay.engineVersion,

      rules_version:
        replay.rulesVersion,

      score_version:
        replay.scoreVersion,

      replay_version:
        replay.replayVersion,
    });

  engine.validateReplayTranscript(
    replay
  );

  const response =
    await apiClient.post(
      `${GAME_PATH}/session/${normalizedSessionId}/continue`,

      {
        request_id:
          normalizedRequestId,

        replay,
      },

      authConfig()
    );

  return (
    normalizeAuthoritativeContinuePurchase(
      unwrapResponse(
        response
      ),
      normalizedSessionId
    )
  );
}
