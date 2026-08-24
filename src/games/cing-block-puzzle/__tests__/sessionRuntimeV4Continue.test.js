import test from "node:test";

import assert from "node:assert/strict";

import {
  BOARD_SIZE,
  canPlacePiece,
} from "../engine/v4/index.js";

import {
  createAuthorizedBlockPuzzleRuntime,
  applyAuthorizedBlockPuzzleMove,
  applyAuthorizedBlockPuzzleContinue,
} from "../runtime/blockPuzzleSessionRuntime.js";

function sessionV4(
  seed = 0x24681357
) {
  return {
    session_id:
      "11111111-1111-4111-8111-111111111111",

    seed,

    engine_version: 3,
    rules_version: 3,
    score_version: 3,
    replay_version: 4,

    play_cost: 1,

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

    if (!piece) {
      continue;
    }

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

function terminalV4Runtime() {
  let runtime =
    createAuthorizedBlockPuzzleRuntime(
      sessionV4()
    );

  for (
    let guard = 0;
    guard < 5000 &&
    !runtime.state.ended;
    guard += 1
  ) {
    const move =
      firstLegalMove(
        runtime.state
      );

    assert.ok(
      move,
      "terminal search must find legal move before authoritative game over"
    );

    runtime =
      applyAuthorizedBlockPuzzleMove(
        runtime,
        move
      );
  }

  assert.equal(
    runtime.state.ended,
    true
  );

  return runtime;
}

test(
  "authorized V4 runtime accepts purchased Continue through engine capability",
  () => {
    const terminal =
      terminalV4Runtime();

    const resumed =
      applyAuthorizedBlockPuzzleContinue(
        terminal,
        {
          session_id:
            terminal.session.session_id,

          continue_index: 1,
          continue_count: 1,
        }
      );

    assert.equal(
      resumed.state.ended,
      false
    );

    assert.equal(
      resumed.state.continuesUsed,
      1
    );

    assert.equal(
      resumed.replay.replayVersion,
      4
    );

    assert.equal(
      resumed.replay.events.at(-1)
        ?.type,
      "continue"
    );

    assert.equal(
      resumed.replay.events.at(-1)
        ?.continueIndex,
      1
    );
  }
);

test(
  "V4 Continue rejects purchase authority mismatch",
  () => {
    const terminal =
      terminalV4Runtime();

    assert.throws(
      () =>
        applyAuthorizedBlockPuzzleContinue(
          terminal,
          {
            session_id:
              terminal.session.session_id,

            continue_index: 2,
            continue_count: 2,
          }
        ),
      (error) =>
        error?.code ===
        "BLOCK_PUZZLE_CONTINUE_AUTHORITY_MISMATCH"
    );
  }
);
