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

    assert.ok(
      point.clearance >=
      54
    );

    assert.ok(
      point.clearance <=
      74
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
      54
    );

    assert.equal(
      large.clearance,
      74
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
