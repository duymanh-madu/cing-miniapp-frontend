import test from "node:test";
import assert from "node:assert/strict";

import {
  ENGINE_VERSION,
  RULES_VERSION,
  SCORE_VERSION,
  REPLAY_VERSION,
  PIECE_CATALOG,
  createGameState,
  generateTray,
  getShape,
  applyMove,
  scorePlacement,
  perfectClearBonus,
} from "../engine/v4/index.js";

test(
  "V4 deterministic contract is exactly 3/3/3/4",
  () => {
    assert.equal(
      ENGINE_VERSION,
      3
    );
    assert.equal(
      RULES_VERSION,
      3
    );
    assert.equal(
      SCORE_VERSION,
      3
    );
    assert.equal(
      REPLAY_VERSION,
      4
    );
  }
);

test(
  "V4 shape catalog has 37 unique weighted shapes",
  () => {
    assert.equal(
      PIECE_CATALOG.length,
      37
    );

    const ids =
      new Set(
        PIECE_CATALOG.map(
          shape => shape.id
        )
      );

    assert.equal(
      ids.size,
      37
    );

    for (
      const shape of
      PIECE_CATALOG
    ) {
      assert.ok(
        Number.isSafeInteger(
          shape.weight
        )
      );

      assert.ok(
        shape.weight > 0
      );
    }
  }
);

test(
  "V4 includes expanded strategic shape families",
  () => {
    for (
      const shapeId of [
        "line6-h",
        "line6-v",
        "rect2x3",
        "rect3x2",
        "s4-h",
        "s4-v",
        "z4-h",
        "z4-v",
        "l4-a",
        "l4-b",
        "l4-c",
        "l4-d",
        "cross5",
        "u7",
      ]
    ) {
      assert.ok(
        getShape(shapeId),
        shapeId
      );
    }
  }
);

test(
  "V4 weighted tray generation remains deterministic",
  () => {
    const a =
      generateTray(
        123456789,
        1,
        3
      );

    const b =
      generateTray(
        123456789,
        1,
        3
      );

    assert.deepEqual(
      a,
      b
    );
  }
);

test(
  "V4 perfect clear bonus is deterministic and combo aware",
  () => {
    assert.equal(
      perfectClearBonus(1),
      400
    );

    assert.equal(
      perfectClearBonus(4),
      700
    );

    const scored =
      scorePlacement({
        placedCellCount: 1,
        lineCount: 1,
        previousCombo: 0,
        previousComboGraceMoves: 0,
        perfectClear: true,
      });

    assert.equal(
      scored.perfectClear,
      true
    );

    assert.equal(
      scored.perfectClearScore,
      400
    );
  }
);

test(
  "V4 engine detects authoritative perfect clear after resolution",
  () => {
    const base =
      createGameState({
        seed: 777,
      });

    const board =
      Array.from(
        { length: 8 },
        () =>
          Array(8).fill(0)
      );

    for (
      let col = 0;
      col < 7;
      col += 1
    ) {
      board[0][col] = 1;
    }

    const dot =
      getShape("dot");

    const state = {
      ...base,

      board,

      tray:
        Object.freeze([
          Object.freeze({
            instanceId: "perfect-clear-dot",
            shapeId: dot.id,
            cells: dot.cells,
            cellCount: dot.cellCount,
          }),
          null,
          null,
        ]),
    };

    const applied =
      applyMove(
        state,
        {
          trayIndex: 0,
          row: 0,
          col: 7,
        }
      );

    assert.equal(
      applied.event.lineCount,
      1
    );

    assert.equal(
      applied.event.perfectClear,
      true
    );

    assert.equal(
      applied.event.perfectClearScore,
      400
    );

    assert.equal(
      applied.state.score,
      applied.event.gainedScore
    );

    assert.equal(
      applied.state.board.every(
        row =>
          row.every(
            cell => cell === 0
          )
      ),
      true
    );
  }
);

import {
  getBlockPuzzleEngineForContract,
} from "../runtime/blockPuzzleEngineRegistry.js";

test(
  "frontend registry resolves exact V4 contract",
  () => {
    const engine =
      getBlockPuzzleEngineForContract({
        engine_version: 3,
        rules_version: 3,
        score_version: 3,
        replay_version: 4,
      });

    assert.equal(
      engine.ENGINE_VERSION,
      3
    );

    assert.equal(
      engine.REPLAY_VERSION,
      4
    );
  }
);

test(
  "frontend registry rejects mixed V4 contract",
  () => {
    assert.throws(
      () =>
        getBlockPuzzleEngineForContract({
          engine_version: 3,
          rules_version: 2,
          score_version: 3,
          replay_version: 4,
        }),
      /Unsupported Cing Block Puzzle deterministic engine contract/
    );
  }
);

test(
  "V4 replay deterministically reproduces authoritative moves",
  () => {
    const seed =
      246813579;

    const engine =
      getBlockPuzzleEngineForContract({
        engine_version: 3,
        rules_version: 3,
        score_version: 3,
        replay_version: 4,
      });

    let state =
      engine.createGameState({
        seed,
      });

    let replay =
      engine.createReplayTranscript(
        seed
      );

    let accepted = 0;

    for (
      let turn = 0;
      turn < 12 &&
      !state.ended;
      turn += 1
    ) {
      let chosen = null;

      for (
        let trayIndex = 0;
        trayIndex <
          state.tray.length &&
        !chosen;
        trayIndex += 1
      ) {
        const piece =
          state.tray[
            trayIndex
          ];

        if (!piece) {
          continue;
        }

        for (
          let row = 0;
          row < 8 &&
          !chosen;
          row += 1
        ) {
          for (
            let col = 0;
            col < 8;
            col += 1
          ) {
            try {
              const replayMove =
                engine.createReplayMove(
                  state,
                  {
                    trayIndex,
                    row,
                    col,
                  }
                );

              const applied =
                engine.applyMove(
                  state,
                  {
                    trayIndex,
                    row,
                    col,
                  }
                );

              chosen = {
                replayMove,
                state:
                  applied.state,
              };

              break;
            } catch {
            }
          }
        }
      }

      if (!chosen) {
        break;
      }

      replay =
        engine.appendReplayMove(
          replay,
          chosen.replayMove
        );

      state =
        chosen.state;

      accepted += 1;
    }

    assert.ok(
      accepted > 0
    );

    const replayed =
      engine.replayTranscript(
        replay
      );

    assert.equal(
      replayed.state.score,
      state.score
    );

    assert.equal(
      replayed.state.moves,
      state.moves
    );

    assert.deepEqual(
      replayed.state.board,
      state.board
    );

    assert.deepEqual(
      replayed.state.tray,
      state.tray
    );
  }
);

test(
  "V4 continue deterministically restores playability",
  () => {
    const engine =
      getBlockPuzzleEngineForContract({
        engine_version: 3,
        rules_version: 3,
        score_version: 3,
        replay_version: 4,
      });

    const base =
      engine.createGameState({
        seed: 987654321,
      });

    const terminal =
      Object.freeze({
        ...base,
        tray:
          Object.freeze([
            null,
            null,
            null,
          ]),
        ended: true,
      });

    const continued =
      engine.applyContinue(
        terminal
      );

    assert.equal(
      continued.state.ended,
      false
    );

    assert.equal(
      continued.state.continuesUsed,
      1
    );

    assert.equal(
      continued.event.type,
      "continued"
    );

    assert.equal(
      continued.event.continueIndex,
      1
    );

    assert.equal(
      engine.isGameOver(
        continued.state.board,
        continued.state.tray
      ),
      false
    );

    assert.equal(
      continued.state.score,
      terminal.score
    );

    assert.deepEqual(
      continued.state.board,
      terminal.board
    );
  }
);
