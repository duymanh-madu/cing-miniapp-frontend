const SUPPORTED =
  Object.freeze([
    Object.freeze({
      engine_version: 1,
      rules_version: 1,
      score_version: 1,
      replay_version: 1,
      max_continues: 0,
    }),

    Object.freeze({
      engine_version: 2,
      rules_version: 2,
      score_version: 2,
      replay_version: 2,
      max_continues: 0,
    }),

    Object.freeze({
      engine_version: 2,
      rules_version: 2,
      score_version: 2,
      replay_version: 3,
      max_continues: 0,
    }),

    Object.freeze({
      engine_version: 3,
      rules_version: 3,
      score_version: 3,
      replay_version: 4,
      max_continues: 3,
    }),

    Object.freeze({
      engine_version: 4,
      rules_version: 4,
      score_version: 3,
      replay_version: 5,
      max_continues: 5,
    }),
  ]);

function fail() {
  const error =
    new Error(
      "Unsupported Block Puzzle Continue session contract"
    );

  error.code =
    "BLOCK_PUZZLE_CONTINUE_VERSION_UNSUPPORTED";

  throw error;
}

export function
getBlockPuzzleMaxContinues(
  session
) {
  if (
    !session ||
    typeof session !== "object" ||
    Array.isArray(session)
  ) {
    fail();
  }

  const matched =
    SUPPORTED.find(
      (contract) =>
        session.engine_version ===
          contract.engine_version &&
        session.rules_version ===
          contract.rules_version &&
        session.score_version ===
          contract.score_version &&
        session.replay_version ===
          contract.replay_version
    );

  if (!matched) {
    fail();
  }

  return matched.max_continues;
}

export function
assertBlockPuzzleContinueIndex(
  session,
  continueIndex
) {
  const max =
    getBlockPuzzleMaxContinues(
      session
    );

  if (
    !Number.isSafeInteger(
      continueIndex
    ) ||
    continueIndex < 1 ||
    continueIndex > max
  ) {
    const error =
      new Error(
        "Block Puzzle Continue index invalid for session version"
      );

    error.code =
      "BLOCK_PUZZLE_CONTINUE_INDEX_INVALID";

    throw error;
  }

  return continueIndex;
}
