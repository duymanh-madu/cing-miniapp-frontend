import assert from
  "node:assert/strict";

import {
  test,
} from "node:test";

import {
  getBlockPuzzleMaxContinues,
  assertBlockPuzzleContinueIndex,
} from "../runtime/blockPuzzleContinueVersionPolicy.js";

const V3 = {
  engine_version: 2,
  rules_version: 2,
  score_version: 2,
  replay_version: 3,
};

const V4 = {
  engine_version: 3,
  rules_version: 3,
  score_version: 3,
  replay_version: 4,
};

const V5 = {
  engine_version: 4,
  rules_version: 4,
  score_version: 3,
  replay_version: 5,
};

test(
  "historical V3 has no Continue capability",
  () => {
    assert.equal(
      getBlockPuzzleMaxContinues(
        V3
      ),
      0
    );
  }
);

test(
  "V4 retains exactly three Continues",
  () => {
    assert.equal(
      getBlockPuzzleMaxContinues(
        V4
      ),
      3
    );

    for (
      let index = 1;
      index <= 3;
      index += 1
    ) {
      assert.equal(
        assertBlockPuzzleContinueIndex(
          V4,
          index
        ),
        index
      );
    }
  }
);

test(
  "V4 rejects fourth and fifth Continue",
  () => {
    for (
      const index of [
        4,
        5,
      ]
    ) {
      assert.throws(
        () =>
          assertBlockPuzzleContinueIndex(
            V4,
            index
          ),
        {
          code:
            "BLOCK_PUZZLE_CONTINUE_INDEX_INVALID",
        }
      );
    }
  }
);

test(
  "V5 accepts exactly five Continues",
  () => {
    assert.equal(
      getBlockPuzzleMaxContinues(
        V5
      ),
      5
    );

    for (
      let index = 1;
      index <= 5;
      index += 1
    ) {
      assert.equal(
        assertBlockPuzzleContinueIndex(
          V5,
          index
        ),
        index
      );
    }
  }
);

test(
  "V5 sixth Continue rejected",
  () => {
    assert.throws(
      () =>
        assertBlockPuzzleContinueIndex(
          V5,
          6
        ),
      {
        code:
          "BLOCK_PUZZLE_CONTINUE_INDEX_INVALID",
      }
    );
  }
);

test(
  "mixed version contract rejected",
  () => {
    assert.throws(
      () =>
        getBlockPuzzleMaxContinues({
          ...V5,
          rules_version: 3,
        }),
      {
        code:
          "BLOCK_PUZZLE_CONTINUE_VERSION_UNSUPPORTED",
      }
    );
  }
);

test(
  "null and absent contract rejected",
  () => {
    for (
      const value of [
        null,
        undefined,
        {},
      ]
    ) {
      assert.throws(
        () =>
          getBlockPuzzleMaxContinues(
            value
          ),
        {
          code:
            "BLOCK_PUZZLE_CONTINUE_VERSION_UNSUPPORTED",
        }
      );
    }
  }
);

test(
  "fractional and negative Continue rejected",
  () => {
    for (
      const index of [
        -1,
        0,
        1.5,
        NaN,
        Infinity,
      ]
    ) {
      assert.throws(
        () =>
          assertBlockPuzzleContinueIndex(
            V5,
            index
          ),
        {
          code:
            "BLOCK_PUZZLE_CONTINUE_INDEX_INVALID",
        }
      );
    }
  }
);
