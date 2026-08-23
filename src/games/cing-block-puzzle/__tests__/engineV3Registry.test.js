import test from "node:test";
import assert from "node:assert/strict";

import {
  getBlockPuzzleEngineForContract,
} from "../runtime/blockPuzzleEngineRegistry.js";

test(
  "registry supports exact replay V3 contract without changing engine rules or score versions",
  () => {
    const engine =
      getBlockPuzzleEngineForContract({
        engine_version: 2,
        rules_version: 2,
        score_version: 2,
        replay_version: 3,
      });

    assert.equal(engine.ENGINE_VERSION, 2);
    assert.equal(engine.RULES_VERSION, 2);
    assert.equal(engine.SCORE_VERSION, 2);
    assert.equal(engine.REPLAY_VERSION, 3);
  }
);

test(
  "registry still rejects mixed replay V3 tuple",
  () => {
    assert.throws(
      () =>
        getBlockPuzzleEngineForContract({
          engine_version: 2,
          rules_version: 1,
          score_version: 2,
          replay_version: 3,
        }),
      (error) =>
        error?.code ===
        "BLOCK_PUZZLE_UNSUPPORTED_ENGINE_CONTRACT"
    );
  }
);
