import test from "node:test";
import assert from "node:assert/strict";

import {
  resolveBoardDropOrigin,
} from "../runtime/blockPuzzleDragGeometry.js";

const rect = {
  left: 100,
  top: 200,
  width: 320,
  height: 320,
};

test(
  "board pointer maps exactly to 8x8 origin",
  () => {
    assert.deepEqual(
      resolveBoardDropOrigin({
        clientX: 120,
        clientY: 220,
        boardRect: rect,
        anchorRow: 0,
        anchorCol: 0,
      }),
      {
        row: 0,
        col: 0,
        pointerRow: 0,
        pointerCol: 0,
      }
    );

    assert.deepEqual(
      resolveBoardDropOrigin({
        clientX: 419,
        clientY: 519,
        boardRect: rect,
        anchorRow: 0,
        anchorCol: 0,
      }),
      {
        row: 7,
        col: 7,
        pointerRow: 7,
        pointerCol: 7,
      }
    );
  }
);

test(
  "clicked piece cell becomes drag anchor",
  () => {
    assert.deepEqual(
      resolveBoardDropOrigin({
        clientX: 220,
        clientY: 360,
        boardRect: rect,
        anchorRow: 2,
        anchorCol: 1,
      }),
      {
        row: 2,
        col: 2,
        pointerRow: 4,
        pointerCol: 3,
      }
    );
  }
);

test(
  "pointer outside board yields no drop origin",
  () => {
    assert.equal(
      resolveBoardDropOrigin({
        clientX: 99,
        clientY: 220,
        boardRect: rect,
        anchorRow: 0,
        anchorCol: 0,
      }),
      null
    );

    assert.equal(
      resolveBoardDropOrigin({
        clientX: 420,
        clientY: 220,
        boardRect: rect,
        anchorRow: 0,
        anchorCol: 0,
      }),
      null
    );
  }
);

test(
  "invalid geometry fails closed",
  () => {
    assert.equal(
      resolveBoardDropOrigin({
        clientX: NaN,
        clientY: 220,
        boardRect: rect,
        anchorRow: 0,
        anchorCol: 0,
      }),
      null
    );

    assert.equal(
      resolveBoardDropOrigin({
        clientX: 120,
        clientY: 220,
        boardRect: {
          ...rect,
          width: 0,
        },
        anchorRow: 0,
        anchorCol: 0,
      }),
      null
    );
  }
);
