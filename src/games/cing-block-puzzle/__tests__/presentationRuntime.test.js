import test from "node:test";
import assert from "node:assert/strict";

import {
  createAuthorizedBlockPuzzleRuntime,
  recoverAuthorizedBlockPuzzleRuntime,
  applyAuthorizedBlockPuzzleMove,
  applyAuthorizedBlockPuzzleMoveWithPresentation,
} from "../runtime/blockPuzzleSessionRuntime.js";

import {
  canPlacePiece,
} from "../engine/v2/placement.js";

const sessionV2 = Object.freeze({
  session_id:
    "b2-presentation-runtime-test",
  seed: 123456,
  engine_version: 2,
  rules_version: 2,
  score_version: 2,
  replay_version: 2,
  play_cost: 1,
  expires_at:
    "2099-01-01T00:00:00.000Z",
});

function firstLegalMove(state) {
  for (
    let trayIndex = 0;
    trayIndex < state.tray.length;
    trayIndex += 1
  ) {
    const piece =
      state.tray[trayIndex];

    if (!piece) {
      continue;
    }

    for (
      let row = 0;
      row < 8;
      row += 1
    ) {
      for (
        let col = 0;
        col < 8;
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
  "presentation-aware move returns runtime and exact engine event",
  () => {
    const initial =
      createAuthorizedBlockPuzzleRuntime(
        sessionV2
      );

    const move =
      firstLegalMove(
        initial.state
      );

    assert.ok(move);

    const result =
      applyAuthorizedBlockPuzzleMoveWithPresentation(
        initial,
        move
      );

    assert.deepEqual(
      Object.keys(result).sort(),
      [
        "presentationEvent",
        "runtime",
      ]
    );

    assert.equal(
      result.runtime.state.moves,
      1
    );

    assert.equal(
      result.presentationEvent.type,
      "piece_placed"
    );

    assert.equal(
      result.presentationEvent.score,
      result.runtime.state.score
    );

    assert.equal(
      result.presentationEvent.combo,
      result.runtime.state.combo
    );

    assert.equal(
      result.presentationEvent.ended,
      result.runtime.state.ended
    );
  }
);

test(
  "legacy runtime move API remains backward compatible",
  () => {
    const initial =
      createAuthorizedBlockPuzzleRuntime(
        sessionV2
      );

    const move =
      firstLegalMove(
        initial.state
      );

    assert.ok(move);

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
      Object.prototype.hasOwnProperty.call(
        next,
        "presentationEvent"
      ),
      false
    );
  }
);

test(
  "presentation event is never reconstructed by recovery",
  () => {
    const initial =
      createAuthorizedBlockPuzzleRuntime(
        sessionV2
      );

    const move =
      firstLegalMove(
        initial.state
      );

    const result =
      applyAuthorizedBlockPuzzleMoveWithPresentation(
        initial,
        move
      );

    const recovered =
      recoverAuthorizedBlockPuzzleRuntime(
        result.runtime.session,
        result.runtime.replay
      );

    assert.deepEqual(
      recovered.state,
      result.runtime.state
    );

    assert.deepEqual(
      recovered.replay,
      result.runtime.replay
    );

    assert.equal(
      Object.prototype.hasOwnProperty.call(
        recovered,
        "presentationEvent"
      ),
      false
    );
  }
);
