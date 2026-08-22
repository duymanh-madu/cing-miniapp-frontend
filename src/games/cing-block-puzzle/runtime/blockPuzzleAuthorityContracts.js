import {
  getBlockPuzzleEngineForContract,
} from "./blockPuzzleEngineRegistry.js";

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

  for (
    const key of [
      "engine_version",
      "rules_version",
      "score_version",
      "replay_version",
    ]
  ) {
    assertSafeInteger(
      raw[key],
      key,
      1
    );
  }

  assertSafeInteger(
    raw.play_cost,
    "play_cost",
    1
  );

  let engine;

  try {
    engine =
      getBlockPuzzleEngineForContract(
        raw
      );
  } catch (error) {
    if (
      error?.code ===
      "BLOCK_PUZZLE_UNSUPPORTED_ENGINE_CONTRACT"
    ) {
      fail(
        "BLOCK_PUZZLE_SESSION_VERSION_MISMATCH",
        "Phiên chơi không tương thích với engine hiện tại"
      );
    }

    throw error;
  }

  const localReplay =
    engine.createReplayTranscript(
      raw.seed
    );

  if (
    localReplay.engineVersion !==
      raw.engine_version ||
    localReplay.rulesVersion !==
      raw.rules_version ||
    localReplay.scoreVersion !==
      raw.score_version ||
    localReplay.replayVersion !==
      raw.replay_version
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

  if (
    !Number.isFinite(
      Date.parse(
        expiresAt
      )
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
