import test from "node:test";
import assert from "node:assert/strict";

import {
  createBlockPuzzleAudioCuePlan,
} from "../audio/blockPuzzleAudioCuePlan.js";

test(
  "ordinary placement emits placement cue only",
  () => {
    assert.deepEqual(
      createBlockPuzzleAudioCuePlan({
        type:
          "piece_placed",

        lineCount:
          0,

        comboAdvanced:
          false,

        combo:
          0,
      }),

      [
        {
          type:
            "placement",
        },
      ]
    );
  }
);

test(
  "line clear adds exact engine line count cue",
  () => {
    assert.deepEqual(
      createBlockPuzzleAudioCuePlan({
        type:
          "piece_placed",

        lineCount:
          2,

        comboAdvanced:
          false,

        combo:
          0,
      }),

      [
        {
          type:
            "placement",
        },

        {
          type:
            "line_clear",

          lineCount:
            2,
        },
      ]
    );
  }
);

test(
  "combo cue consumes exact engine combo value",
  () => {
    assert.deepEqual(
      createBlockPuzzleAudioCuePlan({
        type:
          "piece_placed",

        lineCount:
          1,

        comboAdvanced:
          true,

        combo:
          4,
      }),

      [
        {
          type:
            "placement",
        },

        {
          type:
            "line_clear",

          lineCount:
            1,
        },

        {
          type:
            "combo",

          combo:
            4,
        },
      ]
    );
  }
);

test(
  "audio cue planning never consumes score authority",
  () => {
    const plan =
      createBlockPuzzleAudioCuePlan({
        type:
          "piece_placed",

        lineCount:
          1,

        comboAdvanced:
          true,

        combo:
          2,

        comboScore:
          999999,

        score:
          999999,
      });

    assert.equal(
      JSON.stringify(plan)
        .includes(
          "999999"
        ),
      false
    );
  }
);
