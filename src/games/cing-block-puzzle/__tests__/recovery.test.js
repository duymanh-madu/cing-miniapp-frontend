import test from "node:test";
import assert from "node:assert/strict";

import {
  createReplayTranscript,
  createReplayMove,
  applyMove,
  appendReplayMove,
  canPlacePiece,
  BOARD_SIZE,
} from "../engine/index.js";

import {
  createAuthorizedBlockPuzzleRuntime,
  recoverAuthorizedBlockPuzzleRuntime,
} from "../runtime/blockPuzzleSessionRuntime.js";

import {
  persistBlockPuzzlePendingStart,
  persistBlockPuzzleRuntime,
  restoreBlockPuzzleRecovery,
  clearBlockPuzzleRecovery,
  isBlockPuzzleSessionExpired,
} from "../runtime/blockPuzzleRecovery.js";

function memoryStorage() {
  const values =
    new Map();

  return {
    getItem(key) {
      return (
        values.has(key)
          ? values.get(key)
          : null
      );
    },

    setItem(key, value) {
      values.set(
        key,
        String(value)
      );
    },

    removeItem(key) {
      values.delete(key);
    },
  };
}

function session(
  seed = 123456
) {
  return {
    session_id:
      "11111111-1111-4111-8111-111111111111",
    seed,
    engine_version: 1,
    rules_version: 1,
    score_version: 1,
    replay_version: 1,
    play_cost: 1,
    expires_at:
      "2099-01-01T00:00:00.000Z",
  };
}

function firstMove(
  state
) {
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

test(
  "pending start persists request id before session exists",
  () => {
    const storage =
      memoryStorage();

    const requestId =
      "22222222-2222-4222-8222-222222222222";

    assert.equal(
      persistBlockPuzzlePendingStart({
        ownerKey:
          "0984966336",
        requestId,
        storage,
      }),
      true
    );

    const restored =
      restoreBlockPuzzleRecovery({
        ownerKey:
          "0984966336",
        storage,
      });

    assert.equal(
      restored.request_id,
      requestId
    );

    assert.equal(
      restored.session,
      null
    );

    assert.equal(
      restored.replay,
      null
    );
  }
);

test(
  "recovery is account-bound",
  () => {
    const storage =
      memoryStorage();

    persistBlockPuzzlePendingStart({
      ownerKey:
        "0984966336",
      requestId:
        "22222222-2222-4222-8222-222222222222",
      storage,
    });

    assert.equal(
      restoreBlockPuzzleRecovery({
        ownerKey:
          "0911111111",
        storage,
      }),
      null
    );
  }
);

test(
  "runtime persistence restores state only by deterministic replay",
  () => {
    const storage =
      memoryStorage();

    const authoritySession =
      session();

    let runtime =
      createAuthorizedBlockPuzzleRuntime(
        authoritySession
      );

    const move =
      firstMove(
        runtime.state
      );

    const replayMove =
      createReplayMove(
        runtime.state,
        move
      );

    const state =
      applyMove(
        runtime.state,
        move
      ).state;

    const replay =
      appendReplayMove(
        createReplayTranscript(
          authoritySession.seed
        ),
        replayMove
      );

    runtime = {
      ...runtime,
      state,
      replay,
    };

    const requestId =
      "22222222-2222-4222-8222-222222222222";

    assert.equal(
      persistBlockPuzzleRuntime({
        ownerKey:
          "0984966336",
        requestId,
        runtime,
        storage,
      }),
      true
    );

    const envelope =
      restoreBlockPuzzleRecovery({
        ownerKey:
          "0984966336",
        storage,
      });

    const recovered =
      recoverAuthorizedBlockPuzzleRuntime(
        envelope.session,
        envelope.replay
      );

    assert.deepEqual(
      recovered.state,
      state
    );

    assert.equal(
      recovered.replay.moves.length,
      state.moves
    );
  }
);

test(
  "corrupted recovery fails closed and is discarded",
  () => {
    const storage =
      memoryStorage();

    storage.setItem(
      "cing_block_puzzle_recovery_v1",
      JSON.stringify({
        storage_version: 1,
        owner_key:
          "0984966336",
        request_id:
          "22222222-2222-4222-8222-222222222222",
        session: {
          unsafe: true,
        },
        replay: {},
      })
    );

    assert.equal(
      restoreBlockPuzzleRecovery({
        ownerKey:
          "0984966336",
        storage,
      }),
      null
    );

    assert.equal(
      storage.getItem(
        "cing_block_puzzle_recovery_v1"
      ),
      null
    );
  }
);

test(
  "expired session is detected deterministically",
  () => {
    assert.equal(
      isBlockPuzzleSessionExpired(
        {
          expires_at:
            "2026-08-22T00:00:00.000Z",
        },
        Date.parse(
          "2026-08-23T00:00:00.000Z"
        )
      ),
      true
    );

    assert.equal(
      isBlockPuzzleSessionExpired(
        {
          expires_at:
            "2099-01-01T00:00:00.000Z",
        },
        Date.parse(
          "2026-08-23T00:00:00.000Z"
        )
      ),
      false
    );
  }
);

test(
  "completed lifecycle can clear durable recovery",
  () => {
    const storage =
      memoryStorage();

    persistBlockPuzzlePendingStart({
      ownerKey:
        "0984966336",
      requestId:
        "22222222-2222-4222-8222-222222222222",
      storage,
    });

    assert.equal(
      clearBlockPuzzleRecovery({
        storage,
      }),
      true
    );

    assert.equal(
      restoreBlockPuzzleRecovery({
        ownerKey:
          "0984966336",
        storage,
      }),
      null
    );
  }
);
