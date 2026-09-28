import test from "node:test";
import assert from "node:assert/strict";

import {
  BOARD_SIZE,
  MAX_CONTINUES,
  canPlacePiece,
  createReplayContinue,
} from "../engine/v5/index.js";

import {
  createAuthorizedBlockPuzzleRuntime,
  applyAuthorizedBlockPuzzleMove,
  applyAuthorizedBlockPuzzleContinue,
  recoverAuthorizedBlockPuzzleRuntime,
} from "../runtime/blockPuzzleSessionRuntime.js";

import {
  persistBlockPuzzleRuntime,
  restoreBlockPuzzleRecovery,
} from "../runtime/blockPuzzleRecovery.js";

import {
  persistBlockPuzzleTerminalIntent,
  restoreBlockPuzzleTerminalIntent,
  clearBlockPuzzleTerminalIntent,
} from "../runtime/blockPuzzleTerminalIntentRecovery.js";

import {
  assertBlockPuzzleContinueIndex,
  getBlockPuzzleMaxContinues,
} from "../runtime/blockPuzzleContinueVersionPolicy.js";

import {
  normalizeBlockPuzzleV5ReviveResponse,
} from "../runtime/blockPuzzleV5ReviveResponse.js";

const OWNER = "0912345678";

const SESSION_ID =
  "11111111-1111-4111-8111-111111111111";

const START_REQUEST_ID =
  "22222222-2222-4222-8222-222222222222";

const COSTS = [0, 1, 2, 4, 8, 16];

const session = Object.freeze({
  session_id: SESSION_ID,
  seed: 0x24681357,
  engine_version: 4,
  rules_version: 4,
  score_version: 3,
  replay_version: 5,
  play_cost: 0,
  expires_at: "2099-01-01T00:00:00.000Z",
});

function makeStorage() {
  const values = new Map();

  return {
    getItem(key) {
      return values.has(key)
        ? values.get(key)
        : null;
    },

    setItem(key, value) {
      values.set(key, String(value));
    },

    removeItem(key) {
      values.delete(key);
    },
  };
}

function requestIdFor(index) {
  return (
    "33333333-3333-4333-8333-" +
    String(index).padStart(12, "0")
  );
}

function purchaseIdFor(index) {
  return (
    "44444444-4444-4444-8444-" +
    String(index).padStart(12, "0")
  );
}

function firstLegalMove(state) {
  for (
    let trayIndex = 0;
    trayIndex < state.tray.length;
    trayIndex += 1
  ) {
    const piece = state.tray[trayIndex];

    if (!piece) {
      continue;
    }

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

function playToActualGameOver(
  original,
  label
) {
  let runtime = original;

  for (
    let guard = 0;
    guard < 5000 && !runtime.state.ended;
    guard += 1
  ) {
    const move = firstLegalMove(
      runtime.state
    );

    assert.ok(
      move,
      `${label}: playable state must have a legal move`
    );

    runtime =
      applyAuthorizedBlockPuzzleMove(
        runtime,
        move
      );
  }

  assert.equal(
    runtime.state.ended,
    true,
    `${label}: real deterministic game over required`
  );

  assert.ok(
    runtime.state.moves > 0,
    `${label}: real moves required`
  );

  return runtime;
}

function makeOfflineReceipt(
  index,
  balanceBefore
) {
  /*
   * This is a synthetic contract fixture.
   * It is NOT evidence of a backend debit,
   * verified server replay, or ledger entry.
   */

  return {
    purchase_id:
      purchaseIdFor(index),

    session_id:
      SESSION_ID,

    continue_index:
      index,

    credit_cost:
      COSTS[index],

    credit_transaction_id:
      String(1000 + index),

    balance_before:
      balanceBefore,

    balance_after:
      balanceBefore - COSTS[index],

    continue_count:
      index,

    verified_replay_fingerprint:
      "a".repeat(64),

    created_at:
      "2026-09-25T00:00:00.000Z",

    idempotent:
      false,
  };
}

test(
  "V5 completes five real Continues with durable recovery and refuses sixth",
  () => {
    assert.equal(
      MAX_CONTINUES,
      5
    );

    assert.equal(
      getBlockPuzzleMaxContinues(session),
      5
    );

    const runtimeStorage =
      makeStorage();

    const intentStorage =
      makeStorage();

    let runtime =
      createAuthorizedBlockPuzzleRuntime(
        session
      );

    let balance =
      31;

    for (
      let index = 1;
      index <= 5;
      index += 1
    ) {
      runtime =
        playToActualGameOver(
          runtime,
          `Continue ${index}`
        );

      assert.equal(
        runtime.state.continuesUsed,
        index - 1
      );

      const requestId =
        requestIdFor(index);

      /*
       * Durable pending intent exists before
       * any receipt processing.
       */

      assert.equal(
        persistBlockPuzzleTerminalIntent({
          ownerKey: OWNER,
          sessionId: SESSION_ID,
          session,
          action: "continue_pending",
          requestId,
          continueIndex: index,
          storage: intentStorage,
        }),
        true
      );

      const firstIntent =
        restoreBlockPuzzleTerminalIntent({
          ownerKey: OWNER,
          sessionId: SESSION_ID,
          session,
          storage: intentStorage,
        });

      const retriedIntent =
        restoreBlockPuzzleTerminalIntent({
          ownerKey: OWNER,
          sessionId: SESSION_ID,
          session,
          storage: intentStorage,
        });

      assert.equal(
        firstIntent.request_id,
        requestId
      );

      assert.equal(
        retriedIntent.request_id,
        requestId
      );

      assert.equal(
        retriedIntent.continue_index,
        index
      );

      /*
       * Normalize offline receipt fixture.
       * No HTTP or backend financial call.
       */

      const receipt =
        normalizeBlockPuzzleV5ReviveResponse(
          makeOfflineReceipt(
            index,
            balance
          ),
          SESSION_ID
        );

      assert.equal(
        receipt.credit_cost,
        COSTS[index]
      );

      assert.equal(
        receipt.balance_before,
        balance
      );

      balance =
        receipt.balance_after;

      /*
       * Apply the purchase-shaped receipt
       * through the production runtime API.
       */

      const resumed =
        applyAuthorizedBlockPuzzleContinue(
          runtime,
          receipt
        );

      assert.equal(
        resumed.state.ended,
        false
      );

      assert.equal(
        resumed.state.continuesUsed,
        index
      );

      assert.equal(
        resumed.replay.replayVersion,
        5
      );

      assert.equal(
        resumed.replay.events.at(-1)
          ?.type,
        "continue"
      );

      assert.equal(
        resumed.replay.events.at(-1)
          ?.continueIndex,
        index
      );

      assert.ok(
        firstLegalMove(
          resumed.state
        ),
        `Continue ${index}: resumed tray must be playable`
      );

      /*
       * The resumed runtime must be durable
       * BEFORE the pending intent is cleared.
       */

      assert.equal(
        persistBlockPuzzleRuntime({
          ownerKey: OWNER,
          requestId: START_REQUEST_ID,
          runtime: resumed,
          storage: runtimeStorage,
        }),
        true
      );

      assert.equal(
        clearBlockPuzzleTerminalIntent({
          storage: intentStorage,
        }),
        true
      );

      assert.equal(
        restoreBlockPuzzleTerminalIntent({
          ownerKey: OWNER,
          sessionId: SESSION_ID,
          session,
          storage: intentStorage,
        }),
        null
      );

      /*
       * Simulate re-entry from persisted
       * session + deterministic transcript.
       */

      const recovered =
        restoreBlockPuzzleRecovery({
          ownerKey: OWNER,
          storage: runtimeStorage,
        });

      assert.ok(
        recovered,
        `Continue ${index}: recovery envelope required`
      );

      runtime =
        recoverAuthorizedBlockPuzzleRuntime(
          recovered.session,
          recovered.replay
        );

      assert.deepEqual(
        runtime.state,
        resumed.state
      );

      assert.deepEqual(
        runtime.replay,
        resumed.replay
      );
    }

    assert.equal(
      balance,
      0,
      "offline fixtures consume 31 total credits"
    );

    assert.equal(
      runtime.state.continuesUsed,
      5
    );

    runtime =
      playToActualGameOver(
        runtime,
        "After fifth Continue"
      );

    assert.equal(
      runtime.state.continuesUsed,
      5
    );

    assert.throws(
      () =>
        assertBlockPuzzleContinueIndex(
          session,
          6
        ),
      {
        code:
          "BLOCK_PUZZLE_CONTINUE_INDEX_INVALID",
      }
    );

    assert.throws(
      () =>
        createReplayContinue(
          runtime.state
        ),
      /continueIndex|range|invalid|limit/i
    );

    assert.equal(
      persistBlockPuzzleTerminalIntent({
        ownerKey: OWNER,
        sessionId: SESSION_ID,
        session,
        action: "continue_pending",
        requestId: requestIdFor(6),
        continueIndex: 6,
        storage: intentStorage,
      }),
      false
    );

    assert.equal(
      restoreBlockPuzzleTerminalIntent({
        ownerKey: OWNER,
        sessionId: SESSION_ID,
        session,
        storage: intentStorage,
      }),
      null
    );

    assert.equal(
      runtime.replay.events.filter(
        (event) =>
          event.type === "continue"
      ).length,
      5
    );
  }
);
