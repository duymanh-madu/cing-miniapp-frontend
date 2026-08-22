import test from "node:test";
import assert from "node:assert/strict";

import {
  BOARD_SIZE,
  createEmptyBoard,
  countFilledCells,
  canPlacePiece,
  placePieceOnBoard,
  clearCompletedLines,
  scorePlacement,
  createGameState,
  applyMove,
  getShape,
  hasAnyPlacement,
  isGameOver,
  nextUint32,
} from "../engine/index.js";

test("empty board is exactly 8x8", () => {
  const board = createEmptyBoard();

  assert.equal(board.length, BOARD_SIZE);

  for (const row of board) {
    assert.equal(row.length, BOARD_SIZE);
    assert.deepEqual(
      row,
      Array(BOARD_SIZE).fill(0)
    );
  }
});

test("same RNG state produces deterministic next value", () => {
  assert.equal(
    nextUint32(123456789),
    nextUint32(123456789)
  );
});

test("same seed produces identical initial tray", () => {
  const a = createGameState({ seed: 20260822 });
  const b = createGameState({ seed: 20260822 });

  assert.deepEqual(a.tray, b.tray);
  assert.equal(a.rngState, b.rngState);
});

test("placement rejects out-of-bounds and collision", () => {
  const board = createEmptyBoard();
  const piece = {
    cells: [[0, 0], [0, 1]],
  };

  assert.equal(
    canPlacePiece(board, piece, 0, 7),
    false
  );

  const placed =
    placePieceOnBoard(
      board,
      { ...piece, cellCount: 2 },
      0,
      0
    );

  assert.equal(
    canPlacePiece(
      placed,
      piece,
      0,
      0
    ),
    false
  );
});

test("line clear removes a completed row", () => {
  const board = createEmptyBoard();

  board[3] =
    Array(BOARD_SIZE).fill(1);

  const result =
    clearCompletedLines(board);

  assert.deepEqual(
    result.rows,
    [3]
  );

  assert.deepEqual(
    result.cols,
    []
  );

  assert.equal(
    result.lineCount,
    1
  );

  assert.equal(
    result.clearedCellCount,
    8
  );

  assert.deepEqual(
    result.board[3],
    Array(BOARD_SIZE).fill(0)
  );
});

test("row and column clear simultaneously without double-counting intersection", () => {
  const board = createEmptyBoard();

  board[2] =
    Array(BOARD_SIZE).fill(1);

  for (
    let row = 0;
    row < BOARD_SIZE;
    row += 1
  ) {
    board[row][5] = 1;
  }

  const result =
    clearCompletedLines(board);

  assert.deepEqual(
    result.rows,
    [2]
  );

  assert.deepEqual(
    result.cols,
    [5]
  );

  assert.equal(
    result.lineCount,
    2
  );

  assert.equal(
    result.clearedCellCount,
    15
  );
});

test("score combo increases only when lines are cleared", () => {
  const first =
    scorePlacement({
      placedCellCount: 3,
      lineCount: 1,
      previousCombo: 0,
    });

  assert.equal(first.nextCombo, 1);

  const second =
    scorePlacement({
      placedCellCount: 4,
      lineCount: 2,
      previousCombo:
        first.nextCombo,
    });

  assert.equal(second.nextCombo, 2);
  assert.ok(
    second.gainedScore >
      first.gainedScore
  );

  const miss =
    scorePlacement({
      placedCellCount: 1,
      lineCount: 0,
      previousCombo:
        second.nextCombo,
    });

  assert.equal(miss.nextCombo, 0);
});

test("applyMove is deterministic for identical state and move", () => {
  const stateA =
    createGameState({
      seed: 777,
    });

  const stateB =
    createGameState({
      seed: 777,
    });

  const piece =
    stateA.tray[0];

  let move = null;

  outer:
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
          stateA.board,
          piece,
          row,
          col
        )
      ) {
        move = {
          trayIndex: 0,
          row,
          col,
        };
        break outer;
      }
    }
  }

  assert.ok(move);

  const a =
    applyMove(stateA, move);

  const b =
    applyMove(stateB, move);

  assert.deepEqual(
    a,
    b
  );
});

test("piece placement fills exactly its cells before any clear", () => {
  const board =
    createEmptyBoard();

  const shape =
    getShape("l3-a");

  const next =
    placePieceOnBoard(
      board,
      shape,
      1,
      1
    );

  assert.equal(
    countFilledCells(next),
    shape.cellCount
  );
});

test("game-over detector returns true when remaining piece has no legal placement", () => {
  const board =
    Array.from(
      { length: BOARD_SIZE },
      () =>
        Array(BOARD_SIZE).fill(1)
    );

  board[0][0] = 0;

  const square =
    getShape("square2");

  assert.equal(
    hasAnyPlacement(
      board,
      square
    ),
    false
  );

  assert.equal(
    isGameOver(
      board,
      [square]
    ),
    true
  );
});
