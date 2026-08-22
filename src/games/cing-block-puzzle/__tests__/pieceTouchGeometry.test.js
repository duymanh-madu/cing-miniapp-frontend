import test from
  "node:test";

import assert from
  "node:assert/strict";

import {
  resolveNearestPieceAnchor,
} from "../runtime/blockPuzzlePieceTouchGeometry.js";

const piece = {
  cells: [
    [0, 0],
    [1, 0],
    [2, 0],
    [1, 1],
  ],
};

const slotRect = {
  left: 100,
  top: 200,
  width: 92,
  height: 92,
};

test(
  "magnetic touch selects nearest occupied cell",
  () => {
    assert.deepEqual(
      resolveNearestPieceAnchor({
        clientX: 146,
        clientY: 246,
        slotRect,
        piece,
        slotSize: 92,
        cellSize: 25,
      }),
      {
        row: 1,
        col: 0,
      }
    );
  }
);

test(
  "touch in empty part of piece grid still selects nearest occupied cell",
  () => {
    const anchor =
      resolveNearestPieceAnchor({
        clientX: 167,
        clientY: 220,
        slotRect,
        piece,
        slotSize: 92,
        cellSize: 25,
      });

    assert.deepEqual(
      anchor,
      {
        row: 1,
        col: 1,
      }
    );
  }
);

test(
  "touch near outer edge of slot still captures that slot piece",
  () => {
    const anchor =
      resolveNearestPieceAnchor({
        clientX: 190,
        clientY: 290,
        slotRect,
        piece,
        slotSize: 92,
        cellSize: 25,
      });

    assert.ok(anchor);

    assert.equal(
      piece.cells.some(
        ([row, col]) =>
          row === anchor.row &&
          col === anchor.col
      ),
      true
    );
  }
);

test(
  "invalid magnetic geometry fails closed",
  () => {
    assert.equal(
      resolveNearestPieceAnchor({
        clientX: NaN,
        clientY: 250,
        slotRect,
        piece,
        slotSize: 92,
        cellSize: 25,
      }),
      null
    );
  }
);
