import test from "node:test";
import assert from "node:assert/strict";

import {
  resolveBlockPuzzleDragControlPoint,
} from "../runtime/blockPuzzleDragControlPoint.js";

test(
  "drag control point floats above finger",
  () => {
    const point =
      resolveBlockPuzzleDragControlPoint({
        clientX:
          180,

        clientY:
          420,

        cellHeight:
          42,
      });

    assert.equal(
      point.clientX,
      180
    );

    assert.ok(
      point.clientY <
      420
    );

    assert.equal(
      point.clearance,
      42 * 2.15
    );

    assert.equal(
      point.clientY,
      420 - (42 * 2.15)
    );
  }
);

test(
  "finger clearance adapts to board cell size",
  () => {
    const compact =
      resolveBlockPuzzleDragControlPoint({
        clientX: 0,
        clientY: 200,
        cellHeight: 30,
      });

    const large =
      resolveBlockPuzzleDragControlPoint({
        clientX: 0,
        clientY: 200,
        cellHeight: 60,
      });

    assert.equal(
      compact.clearance,
      78
    );

    assert.equal(
      large.clearance,
      108
    );
  }
);

test(
  "invalid drag geometry fails closed",
  () => {
    assert.equal(
      resolveBlockPuzzleDragControlPoint({
        clientX: NaN,
        clientY: 0,
        cellHeight: 40,
      }),
      null
    );
  }
);
