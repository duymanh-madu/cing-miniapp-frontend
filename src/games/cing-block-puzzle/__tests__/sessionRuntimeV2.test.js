import test from "node:test";
import assert from "node:assert/strict";

import {
  BOARD_SIZE,
  canPlacePiece,
} from "../engine/v2/index.js";

import {
  createAuthorizedBlockPuzzleRuntime,
  applyAuthorizedBlockPuzzleMove,
  recoverAuthorizedBlockPuzzleRuntime,
} from "../runtime/blockPuzzleSessionRuntime.js";

function sessionV2(
  seed = 24680
) {
  return {
    session_id:
      "11111111-1111-4111-8111-111111111111",

    seed,

    engine_version: 2,
    rules_version: 2,
    score_version: 2,
    replay_version: 2,

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

test(
  "authorized runtime initializes exact V2 contract from server session",
  () => {
    const runtime =
      createAuthorizedBlockPuzzleRuntime(
        sessionV2()
      );

    assert.equal(
      runtime.state.engineVersion,
      2
    );

    assert.equal(
      runtime.replay.replayVersion,
      2
    );
  }
);

test(
  "V2 authorized runtime remains exactly replay recoverable",
  () => {
    let runtime =
      createAuthorizedBlockPuzzleRuntime(
        sessionV2()
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
