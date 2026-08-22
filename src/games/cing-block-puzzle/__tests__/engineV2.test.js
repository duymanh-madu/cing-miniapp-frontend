import test from "node:test";
import assert from "node:assert/strict";

import {
  COMBO_GRACE_MOVES,
  comboAdvanceBonus,
  createGameState,
  scorePlacement,
} from "../engine/v2/index.js";

import {
  getBlockPuzzleEngineForContract,
} from "../runtime/blockPuzzleEngineRegistry.js";

function clear({
  combo,
  grace,
  lines = 1,
}) {
  return scorePlacement({
    placedCellCount: 1,
    lineCount: lines,
    previousCombo: combo,
    previousComboGraceMoves:
      grace,
  });
}

function miss({
  combo,
  grace,
}) {
  return scorePlacement({
    placedCellCount: 1,
    lineCount: 0,
    previousCombo: combo,
    previousComboGraceMoves:
      grace,
  });
}

test(
  "V2 deterministic contract is exactly 2/2/2",
  () => {
    const state =
      createGameState({
        seed: 123456,
      });

    assert.equal(
      state.engineVersion,
      2
    );

    assert.equal(
      state.rulesVersion,
      2
    );

    assert.equal(
      state.scoreVersion,
      2
    );

    assert.equal(
      state.combo,
      0
    );

    assert.equal(
      state.comboGraceMoves,
      0
    );
  }
);

test(
  "combo clear opens exactly three grace moves",
  () => {
    const first =
      clear({
        combo: 0,
        grace: 0,
      });

    assert.equal(
      first.nextCombo,
      1
    );

    assert.equal(
      first.nextComboGraceMoves,
      COMBO_GRACE_MOVES
    );

    assert.equal(
      first.comboAdvanced,
      true
    );
  }
);

test(
  "combo survives first and second miss",
  () => {
    const first =
      clear({
        combo: 0,
        grace: 0,
      });

    const miss1 =
      miss({
        combo:
          first.nextCombo,
        grace:
          first.nextComboGraceMoves,
      });

    assert.equal(
      miss1.nextCombo,
      1
    );

    assert.equal(
      miss1.nextComboGraceMoves,
      2
    );

    const miss2 =
      miss({
        combo:
          miss1.nextCombo,
        grace:
          miss1.nextComboGraceMoves,
      });

    assert.equal(
      miss2.nextCombo,
      1
    );

    assert.equal(
      miss2.nextComboGraceMoves,
      1
    );
  }
);

test(
  "clear on third grace move advances combo",
  () => {
    const thirdMoveClear =
      clear({
        combo: 1,
        grace: 1,
      });

    assert.equal(
      thirdMoveClear.nextCombo,
      2
    );

    assert.equal(
      thirdMoveClear.nextComboGraceMoves,
      3
    );

    assert.equal(
      thirdMoveClear.comboAdvanced,
      true
    );
  }
);

test(
  "third consecutive miss resets combo",
  () => {
    const expired =
      miss({
        combo: 4,
        grace: 1,
      });

    assert.equal(
      expired.nextCombo,
      0
    );

    assert.equal(
      expired.nextComboGraceMoves,
      0
    );

    assert.equal(
      expired.comboAdvanced,
      false
    );
  }
);

test(
  "combo bonus is awarded only when combo advances",
  () => {
    assert.equal(
      comboAdvanceBonus(1),
      5
    );

    assert.equal(
      comboAdvanceBonus(2),
      15
    );

    assert.equal(
      comboAdvanceBonus(3),
      30
    );

    assert.equal(
      comboAdvanceBonus(4),
      50
    );

    assert.equal(
      comboAdvanceBonus(5),
      75
    );

    const held =
      miss({
        combo: 3,
        grace: 3,
      });

    assert.equal(
      held.comboScore,
      0
    );
  }
);

test(
  "mixed unsupported deterministic version tuple fails closed",
  () => {
    assert.throws(
      () =>
        getBlockPuzzleEngineForContract({
          engine_version: 2,
          rules_version: 1,
          score_version: 2,
          replay_version: 2,
        }),
      (error) =>
        error?.code ===
        "BLOCK_PUZZLE_UNSUPPORTED_ENGINE_CONTRACT"
    );
  }
);

test(
  "registry preserves V1 and supports V2 side by side",
  () => {
    const v1 =
      getBlockPuzzleEngineForContract({
        engine_version: 1,
        rules_version: 1,
        score_version: 1,
        replay_version: 1,
      });

    const v2 =
      getBlockPuzzleEngineForContract({
        engine_version: 2,
        rules_version: 2,
        score_version: 2,
        replay_version: 2,
      });

    assert.equal(
      v1.ENGINE_VERSION,
      1
    );

    assert.equal(
      v2.ENGINE_VERSION,
      2
    );
  }
);
