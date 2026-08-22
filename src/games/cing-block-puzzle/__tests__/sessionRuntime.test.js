import test from
  "node:test";

import assert from
  "node:assert/strict";

import {
  BOARD_SIZE,
  canPlacePiece,
} from "../engine/index.js";

import {
  createAuthorizedBlockPuzzleRuntime,
  applyAuthorizedBlockPuzzleMove,
  assertTerminalBlockPuzzleRuntime,
  applyAuthoritativeBlockPuzzleSubmission,
} from "../runtime/blockPuzzleSessionRuntime.js";

function session(
  seed = 1
) {
  return {
    session_id:
      "11111111-1111-4111-8111-111111111111",

    seed,

    engine_version:
      1,

    rules_version:
      1,

    score_version:
      1,

    replay_version:
      1,

    play_cost:
      1,

    expires_at:
      "2099-01-01T00:00:00.000Z",
  };
}

function firstLegalMove(
  state
) {
  for (
    let trayIndex = 0;
    trayIndex <
      state.tray.length;
    trayIndex += 1
  ) {
    const piece =
      state.tray[
        trayIndex
      ];

    if (!piece) continue;

    for (
      let row = 0;
      row < BOARD_SIZE;
      row += 1
    ) {
      for (
        let col = 0;
        col < BOARD_SIZE;
        col += 1
      ) {
        if (
          canPlacePiece(
            state.board,
            piece,
            row,
            col
          )
        ) {
          return {
            trayIndex,
            row,
            col,
          };
        }
      }
    }
  }

  return null;
}

function buildTerminalRuntime() {
  let runtime =
    createAuthorizedBlockPuzzleRuntime(
      session(1)
    );

  for (
    let i = 0;
    i < 10000;
    i += 1
  ) {
    if (
      runtime.state.ended
    ) {
      return runtime;
    }

    const move =
      firstLegalMove(
        runtime.state
      );

    assert.ok(move);

    runtime =
      applyAuthorizedBlockPuzzleMove(
        runtime,
        move
      );
  }

  throw new Error(
    "test runtime did not terminate"
  );
}

test(
  "authorized runtime initializes only from server session seed",
  () => {
    const runtime =
      createAuthorizedBlockPuzzleRuntime(
        session(123456)
      );

    assert.equal(
      runtime.state.seed,
      123456
    );

    assert.equal(
      runtime.replay.seed,
      123456
    );

    assert.equal(
      runtime.replay.moves.length,
      0
    );
  }
);

test(
  "authorized move keeps gameplay and replay in exact lockstep",
  () => {
    const initial =
      createAuthorizedBlockPuzzleRuntime(
        session(777)
      );

    const move =
      firstLegalMove(
        initial.state
      );

    const next =
      applyAuthorizedBlockPuzzleMove(
        initial,
        move
      );

    assert.equal(
      next.state.moves,
      1
    );

    assert.equal(
      next.replay.moves.length,
      1
    );

    assert.equal(
      next.replay.moves[0]
        .pieceInstanceId,
      initial.state.tray[
        move.trayIndex
      ].instanceId
    );
  }
);

test(
  "runtime cannot submit unfinished gameplay",
  () => {
    const runtime =
      createAuthorizedBlockPuzzleRuntime(
        session(42)
      );

    assert.throws(
      () =>
        assertTerminalBlockPuzzleRuntime(
          runtime
        ),

      (error) =>
        error?.code ===
        "BLOCK_PUZZLE_RUNTIME_NOT_FINISHED"
    );
  }
);

test(
  "terminal runtime replay contains every authoritative move",
  () => {
    const runtime =
      buildTerminalRuntime();

    assert.equal(
      runtime.state.ended,
      true
    );

    assert.equal(
      runtime.replay.moves.length,
      runtime.state.moves
    );

    assert.equal(
      assertTerminalBlockPuzzleRuntime(
        runtime
      ),
      true
    );
  }
);

test(
  "final score comes from server verified_score",
  () => {
    const runtime =
      buildTerminalRuntime();

    const submission = {
      session_id:
        runtime.session
          .session_id,

      score_id:
        "9001",

      verified_score:
        runtime.state.score,

      replay_fingerprint:
        "a".repeat(64),

      move_count:
        runtime.state.moves,

      submitted_at:
        "2099-01-01T00:00:00.000Z",

      idempotent:
        false,
    };

    const finalRuntime =
      applyAuthoritativeBlockPuzzleSubmission(
        runtime,
        submission
      );

    assert.equal(
      finalRuntime.finalScore,
      submission.verified_score
    );

    assert.equal(
      finalRuntime.submission,
      submission
    );
  }
);

test(
  "server score mismatch fails closed",
  () => {
    const runtime =
      buildTerminalRuntime();

    assert.throws(
      () =>
        applyAuthoritativeBlockPuzzleSubmission(
          runtime,
          {
            session_id:
              runtime.session
                .session_id,

            verified_score:
              runtime.state.score +
              1,

            move_count:
              runtime.state.moves,
          }
        ),

      (error) =>
        error?.code ===
        "BLOCK_PUZZLE_SUBMISSION_AUTHORITY_MISMATCH"
    );
  }
);

test(
  "authorized runtime can be reconstructed exactly from replay",
  async () => {
    const {
      recoverAuthorizedBlockPuzzleRuntime,
    } = await import(
      "../runtime/blockPuzzleSessionRuntime.js"
    );

    let runtime =
      createAuthorizedBlockPuzzleRuntime(
        session(24680)
      );

    for (
      let i = 0;
      i < 8 &&
      !runtime.state.ended;
      i += 1
    ) {
      const move =
        firstLegalMove(
          runtime.state
        );

      assert.ok(move);

      runtime =
        applyAuthorizedBlockPuzzleMove(
          runtime,
          move
        );
    }

    const recovered =
      recoverAuthorizedBlockPuzzleRuntime(
        runtime.session,
        runtime.replay
      );

    assert.deepEqual(
      recovered.state,
      runtime.state
    );

    assert.deepEqual(
      recovered.replay,
      runtime.replay
    );
  }
);
