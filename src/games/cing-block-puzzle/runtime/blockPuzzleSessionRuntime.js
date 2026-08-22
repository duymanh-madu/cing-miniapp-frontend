import {
  createGameState,
  createReplayTranscript,
  createReplayMove,
  appendReplayMove,
  applyMove,
  validateReplayTranscript,
} from "../engine/index.js";

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

function assertSession(
  session
) {
  if (
    !session ||
    typeof session !==
      "object"
  ) {
    fail(
      "BLOCK_PUZZLE_RUNTIME_SESSION_REQUIRED",
      "Authorized session is required"
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
      "BLOCK_PUZZLE_RUNTIME_SESSION_INVALID",
      "Authorized session seed is invalid"
    );
  }

  if (
    !session.session_id
  ) {
    fail(
      "BLOCK_PUZZLE_RUNTIME_SESSION_INVALID",
      "Authorized session id is invalid"
    );
  }
}

export function
createAuthorizedBlockPuzzleRuntime(
  session
) {
  assertSession(
    session
  );

  const state =
    createGameState({
      seed:
        session.seed,
    });

  const replay =
    createReplayTranscript(
      session.seed
    );

  if (
    state.engineVersion !==
      session.engine_version ||
    state.rulesVersion !==
      session.rules_version ||
    state.scoreVersion !==
      session.score_version ||
    replay.replayVersion !==
      session.replay_version
  ) {
    fail(
      "BLOCK_PUZZLE_RUNTIME_VERSION_MISMATCH",
      "Authorized session does not match local deterministic runtime"
    );
  }

  return Object.freeze({
    session,
    state,
    replay,
    submission:
      null,
  });
}

export function
applyAuthorizedBlockPuzzleMove(
  runtime,
  move
) {
  if (
    !runtime ||
    typeof runtime !==
      "object"
  ) {
    fail(
      "BLOCK_PUZZLE_RUNTIME_REQUIRED",
      "Block Puzzle runtime is required"
    );
  }

  if (
    runtime.submission
  ) {
    fail(
      "BLOCK_PUZZLE_RUNTIME_ALREADY_SUBMITTED",
      "Submitted game cannot accept moves"
    );
  }

  if (
    runtime.state?.ended
  ) {
    fail(
      "BLOCK_PUZZLE_RUNTIME_ENDED",
      "Ended game cannot accept moves"
    );
  }

  /*
   * Capture immutable piece identity from the
   * pre-move state before applying gameplay.
   */
  const replayMove =
    createReplayMove(
      runtime.state,
      move
    );

  const applied =
    applyMove(
      runtime.state,
      move
    );

  const replay =
    appendReplayMove(
      runtime.replay,
      replayMove
    );

  return Object.freeze({
    ...runtime,

    state:
      applied.state,

    replay,

    submission:
      null,
  });
}

export function
assertTerminalBlockPuzzleRuntime(
  runtime
) {
  if (
    !runtime ||
    typeof runtime !==
      "object"
  ) {
    fail(
      "BLOCK_PUZZLE_RUNTIME_REQUIRED",
      "Block Puzzle runtime is required"
    );
  }

  if (
    runtime.state?.ended !==
      true
  ) {
    fail(
      "BLOCK_PUZZLE_RUNTIME_NOT_FINISHED",
      "Game must be over before submission"
    );
  }

  validateReplayTranscript(
    runtime.replay
  );

  if (
    runtime.replay.seed !==
      runtime.session.seed ||
    runtime.replay.moves.length !==
      runtime.state.moves
  ) {
    fail(
      "BLOCK_PUZZLE_RUNTIME_REPLAY_MISMATCH",
      "Local replay is not synchronized with gameplay state"
    );
  }

  return true;
}

export function
applyAuthoritativeBlockPuzzleSubmission(
  runtime,
  submission
) {
  assertTerminalBlockPuzzleRuntime(
    runtime
  );

  if (
    !submission ||
    typeof submission !==
      "object"
  ) {
    fail(
      "BLOCK_PUZZLE_SUBMISSION_REQUIRED",
      "Authoritative submission is required"
    );
  }

  if (
    submission.session_id !==
      runtime.session.session_id
  ) {
    fail(
      "BLOCK_PUZZLE_SUBMISSION_SESSION_MISMATCH",
      "Authoritative submission belongs to another session"
    );
  }

  if (
    submission.move_count !==
      runtime.state.moves ||
    submission.verified_score !==
      runtime.state.score
  ) {
    fail(
      "BLOCK_PUZZLE_SUBMISSION_AUTHORITY_MISMATCH",
      "Server verification differs from deterministic local runtime"
    );
  }

  return Object.freeze({
    ...runtime,

    submission,

    /*
     * Final score is explicitly server-authoritative.
     */
    finalScore:
      submission.verified_score,
  });
}
