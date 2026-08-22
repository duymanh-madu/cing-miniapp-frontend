import {
  getBlockPuzzleEngineForContract,
} from "./blockPuzzleEngineRegistry.js";

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

  const engine =
    getBlockPuzzleEngineForContract(
      session
    );

  const state =
    engine.createGameState({
      seed:
        session.seed,
    });

  const replay =
    engine.createReplayTranscript(
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
recoverAuthorizedBlockPuzzleRuntime(
  session,
  replay
) {
  const initial =
    createAuthorizedBlockPuzzleRuntime(
      session
    );

  const engine =
    getBlockPuzzleEngineForContract(
      session
    );

  engine.validateReplayTranscript(
    replay
  );

  if (
    replay.seed !==
      session.seed ||
    replay.engineVersion !==
      session.engine_version ||
    replay.rulesVersion !==
      session.rules_version ||
    replay.scoreVersion !==
      session.score_version ||
    replay.replayVersion !==
      session.replay_version
  ) {
    fail(
      "BLOCK_PUZZLE_RUNTIME_RECOVERY_VERSION_MISMATCH",
      "Recovery replay does not match authorized session"
    );
  }

  const recovered =
    engine.replayTranscript(
      replay
    );

  if (
    recovered.state.seed !==
      initial.state.seed ||
    recovered.state
      .engineVersion !==
      initial.state
        .engineVersion ||
    recovered.state
      .rulesVersion !==
      initial.state
        .rulesVersion ||
    recovered.state
      .scoreVersion !==
      initial.state
        .scoreVersion ||
    recovered.state.moves !==
      replay.moves.length
  ) {
    fail(
      "BLOCK_PUZZLE_RUNTIME_RECOVERY_MISMATCH",
      "Recovered deterministic state is invalid"
    );
  }

  return Object.freeze({
    session,
    state:
      recovered.state,
    replay:
      structuredClone(
        replay
      ),
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
  const engine =
    getBlockPuzzleEngineForContract(
      runtime.session
    );

  const replayMove =
    engine.createReplayMove(
      runtime.state,
      move
    );

  const applied =
    engine.applyMove(
      runtime.state,
      move
    );

  const replay =
    engine.appendReplayMove(
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

  const engine =
    getBlockPuzzleEngineForContract(
      runtime.session
    );

  engine.validateReplayTranscript(
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
