import test from "node:test";
import assert from "node:assert/strict";

import {
  BOARD_SIZE,
  canPlacePiece,
  createGameState,
  applyMove,
  createReplayTranscript,
  createReplayMove,
  appendReplayMove,
  replayTranscript,
  getReplaySummary,
  replayFingerprint,
  validateReplayTranscript,
} from "../engine/index.js";

function findFirstLegalMove(
  state,
  trayIndex = 0
) {
  const piece =
    state.tray[trayIndex];

  if (!piece) return null;

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

  return null;
}

function buildTranscript(
  seed,
  moveCount
) {
  let state =
    createGameState({
      seed,
    });

  let transcript =
    createReplayTranscript(
      seed
    );

  for (
    let i = 0;
    i < moveCount;
    i += 1
  ) {
    if (state.ended) break;

    let rawMove = null;

    for (
      let trayIndex = 0;
      trayIndex <
      state.tray.length;
      trayIndex += 1
    ) {
      rawMove =
        findFirstLegalMove(
          state,
          trayIndex
        );

      if (rawMove) break;
    }

    if (!rawMove) break;

    const replayMove =
      createReplayMove(
        state,
        rawMove
      );

    transcript =
      appendReplayMove(
        transcript,
        replayMove
      );

    state =
      applyMove(
        state,
        rawMove
      ).state;
  }

  return {
    transcript,
    state,
  };
}

test(
  "replay reproduces authoritative final state",
  () => {
    const {
      transcript,
      state,
    } =
      buildTranscript(
        20260822,
        12
      );

    const replayed =
      replayTranscript(
        transcript
      );

    assert.deepEqual(
      replayed.state,
      state
    );
  }
);

test(
  "same replay has stable deterministic fingerprint",
  () => {
    const { transcript } =
      buildTranscript(
        123456,
        8
      );

    assert.equal(
      replayFingerprint(
        transcript
      ),
      replayFingerprint(
        structuredClone(
          transcript
        )
      )
    );
  }
);

test(
  "tampering shape identity is rejected",
  () => {
    const { transcript } =
      buildTranscript(
        998877,
        3
      );

    const tampered =
      structuredClone(
        transcript
      );

    tampered.moves[0]
      .shapeId = "dot";

    if (
      transcript.moves[0]
        .shapeId === "dot"
    ) {
      tampered.moves[0]
        .shapeId =
        "square3";
    }

    assert.throws(
      () =>
        replayTranscript(
          tampered
        ),
      /shape mismatch/
    );
  }
);

test(
  "tampering piece instance identity is rejected",
  () => {
    const { transcript } =
      buildTranscript(
        777777,
        2
      );

    const tampered =
      structuredClone(
        transcript
      );

    tampered.moves[0]
      .pieceInstanceId =
        "p999999";

    assert.throws(
      () =>
        replayTranscript(
          tampered
        ),
      /piece instance mismatch/
    );
  }
);

test(
  "illegal placement in transcript fails closed",
  () => {
    const { transcript } =
      buildTranscript(
        456789,
        1
      );

    const tampered =
      structuredClone(
        transcript
      );

    tampered.moves[0].row = 7;
    tampered.moves[0].col = 7;

    const samePosition =
      transcript.moves[0].row === 7 &&
      transcript.moves[0].col === 7;

    if (samePosition) {
      tampered.moves[0].row = 0;
      tampered.moves[0].col = 0;
    }

    const attempt = () =>
      replayTranscript(
        tampered
      );

    try {
      attempt();
    } catch (error) {
      assert.match(
        error.message,
        /illegal placement|mismatch/
      );
      return;
    }

    /*
     * If altered coordinates happened
     * to remain legal, authoritative replay
     * must still derive a different state.
     */
    assert.notDeepEqual(
      replayTranscript(
        tampered
      ).state,
      replayTranscript(
        transcript
      ).state
    );
  }
);

test(
  "unsupported replay version fails closed",
  () => {
    const transcript =
      createReplayTranscript(
        42
      );

    transcript.replayVersion =
      999;

    assert.throws(
      () =>
        validateReplayTranscript(
          transcript
        ),
      /unsupported replay version/
    );
  }
);

test(
  "unsupported engine version fails closed",
  () => {
    const transcript =
      createReplayTranscript(
        42
      );

    transcript.engineVersion =
      999;

    assert.throws(
      () =>
        validateReplayTranscript(
          transcript
        ),
      /unsupported engine version/
    );
  }
);

test(
  "unknown transcript fields fail closed",
  () => {
    const transcript =
      createReplayTranscript(
        42
      );

    transcript.untrusted =
      true;

    assert.throws(
      () =>
        validateReplayTranscript(
          transcript
        ),
      /unsupported or missing fields/
    );
  }
);

test(
  "unknown move fields fail closed",
  () => {
    const {
      transcript,
    } =
      buildTranscript(
        808080,
        1
      );

    transcript.moves[0]
      .extra = true;

    assert.throws(
      () =>
        validateReplayTranscript(
          transcript
        ),
      /unsupported or missing fields/
    );
  }
);

test(
  "summary is derived from replay rather than submitted score",
  () => {
    const {
      transcript,
      state,
    } =
      buildTranscript(
        13579,
        10
      );

    const summary =
      getReplaySummary(
        transcript
      );

    assert.equal(
      summary.score,
      state.score
    );

    assert.equal(
      summary.moves,
      state.moves
    );

    assert.equal(
      summary.bestCombo,
      state.bestCombo
    );

    assert.equal(
      summary.totalLinesCleared,
      state.totalLinesCleared
    );
  }
);
