import test from "node:test";
import assert from "node:assert/strict";

import {
  BOARD_SIZE,
  MAX_CONTINUES,
  createGameState,
  applyMove,
  applyContinue,
  canPlacePiece,
  createReplayTranscript,
  createReplayMove,
  createReplayContinue,
  appendReplayMove,
  appendReplayContinue,
  replayTranscript,
  replayFingerprint,
} from "../engine/v3/index.js";

function findLegalMove(state) {
  for (
    let trayIndex = 0;
    trayIndex <
      state.tray.length;
    trayIndex += 1
  ) {
    const piece =
      state.tray[
        trayIndex
      ];

    if (!piece) continue;

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
            state.board,
            piece,
            row,
            col
          )
        ) {
          return {
            trayIndex,
            row,
            col,
          };
        }
      }
    }
  }

  return null;
}

function playUntilEnded(
  state,
  transcript,
  maxMoves = 5000
) {
  let currentState =
    state;

  let currentReplay =
    transcript;

  for (
    let i = 0;
    i < maxMoves;
    i += 1
  ) {
    if (
      currentState.ended
    ) {
      return {
        state:
          currentState,

        replay:
          currentReplay,
      };
    }

    const move =
      findLegalMove(
        currentState
      );

    assert.ok(
      move,
      "non-terminal state must expose a legal move"
    );

    const replayMove =
      createReplayMove(
        currentState,
        move
      );

    currentReplay =
      appendReplayMove(
        currentReplay,
        replayMove
      );

    currentState =
      applyMove(
        currentState,
        move
      ).state;
  }

  throw new Error(
    "test failed to reach terminal state"
  );
}

test(
  "V3 continue preserves board and score while restoring playability",
  () => {
    const seed =
      0x12345678;

    const terminal =
      playUntilEnded(
        createGameState({
          seed,
        }),
        createReplayTranscript(
          seed
        )
      );

    const before =
      terminal.state;

    assert.equal(
      before.ended,
      true
    );

    const applied =
      applyContinue(
        before
      );

    assert.equal(
      applied.state.ended,
      false
    );

    assert.equal(
      applied.state
        .continuesUsed,
      1
    );

    assert.equal(
      applied.state.score,
      before.score
    );

    assert.deepEqual(
      applied.state.board,
      before.board
    );

    assert.ok(
      findLegalMove(
        applied.state
      )
    );
  }
);

test(
  "V3 replay deterministically reproduces terminal continue boundary",
  () => {
    const seed =
      0x24681357;

    const terminal =
      playUntilEnded(
        createGameState({
          seed,
        }),
        createReplayTranscript(
          seed
        )
      );

    const continueEvent =
      createReplayContinue(
        terminal.state
      );

    const continuedReplay =
      appendReplayContinue(
        terminal.replay,
        continueEvent
      );

    const direct =
      applyContinue(
        terminal.state
      ).state;

    const replayed =
      replayTranscript(
        continuedReplay
      ).state;

    assert.deepEqual(
      replayed,
      direct
    );
  }
);

test(
  "continue before game over fails closed",
  () => {
    const state =
      createGameState({
        seed: 12345,
      });

    assert.throws(
      () =>
        createReplayContinue(
          state
        ),
      /before game over/
    );

    assert.throws(
      () =>
        applyContinue(
          state
        ),
      /requires game over/
    );
  }
);

test(
  "V3 permits exactly three ordered continues",
  () => {
    const seed =
      0x13572468;

    let state =
      createGameState({
        seed,
      });

    let replay =
      createReplayTranscript(
        seed
      );

    for (
      let expected = 1;
      expected <=
        MAX_CONTINUES;
      expected += 1
    ) {
      const terminal =
        playUntilEnded(
          state,
          replay
        );

      state =
        terminal.state;

      replay =
        terminal.replay;

      const event =
        createReplayContinue(
          state
        );

      assert.equal(
        event.continueIndex,
        expected
      );

      replay =
        appendReplayContinue(
          replay,
          event
        );

      state =
        applyContinue(
          state
        ).state;
    }

    const finalTerminal =
      playUntilEnded(
        state,
        replay
      );

    assert.equal(
      finalTerminal.state
        .continuesUsed,
      MAX_CONTINUES
    );

    assert.throws(
      () =>
        applyContinue(
          finalTerminal.state
        ),
      /continue limit reached/
    );

    assert.throws(
      () =>
        createReplayContinue(
          finalTerminal.state
        ),
      /safe integer/
    );
  }
);

test(
  "tampered continue order is rejected by replay authority",
  () => {
    const seed =
      0x10203040;

    const terminal =
      playUntilEnded(
        createGameState({
          seed,
        }),
        createReplayTranscript(
          seed
        )
      );

    const tampered = {
      ...terminal.replay,

      events: [
        ...terminal.replay
          .events,

        {
          type: "continue",
          continueIndex: 2,
        },
      ],
    };

    assert.throws(
      () =>
        replayTranscript(
          tampered
        ),
      /continue index mismatch/
    );
  }
);

test(
  "same V3 transcript has stable fingerprint",
  () => {
    const seed = 987654321;

    const terminal =
      playUntilEnded(
        createGameState({
          seed,
        }),
        createReplayTranscript(
          seed
        )
      );

    const replay =
      appendReplayContinue(
        terminal.replay,
        createReplayContinue(
          terminal.state
        )
      );

    assert.equal(
      replayFingerprint(
        replay
      ),
      replayFingerprint(
        structuredClone(
          replay
        )
      )
    );
  }
);
