import test from "node:test";
import assert from "node:assert/strict";

import {
  createOfflineRevivalDurableCoordinator,
} from "../offlineRevivalDurableCoordinator.js";

import {
  readOfflineRevivalOperationIntent,
} from "../offlineRevivalOperationIntent.js";

const SESSION =
  "11111111-1111-4111-8111-111111111111";

const REQUEST_A =
  "22222222-2222-4222-8222-222222222222";

const REQUEST_B =
  "33333333-3333-4333-8333-333333333333";

function makeStorage() {
  const rows = new Map();

  return {
    getItem:
      key => rows.get(key) ?? null,
    setItem:
      (key, value) => {
        rows.set(key, value);
      },
    removeItem:
      key => {
        rows.delete(key);
      },
  };
}

function owner(storage) {
  return {
    storage,
    userId: "member-A",
    gameKey: "black-pearl-rush",
    sessionId: SESSION,
  };
}

function create({
  storage,
  createRequestId =
    () => REQUEST_A,
  markPending,
  applyRevival,
}) {
  return createOfflineRevivalDurableCoordinator({
    ...owner(storage),
    eventSeq: 0,
    revivesUsed: 0,
    createRequestId,
    markPending,
    applyRevival:
      applyRevival ||
      (async () => ({
        applied: true,
        session_id: SESSION,
        session_status: "active",
        event_seq: 2,
        revive_index: 1,
        credit_cost: 1,
      })),
  });
}

function pendingResult(
  reason,
  applied = true
) {
  return {
    applied,
    session_id: SESSION,
    event_id:
      "9007199254740993",
    session_status:
      "revive_pending",
    event_seq: 1,
    revives_used: 0,
    pending_reason: reason,
  };
}

test(
  "pending intent exists before HTTP",
  async () => {
    const storage =
      makeStorage();

    let observed = null;

    const coordinator = create({
      storage,
      markPending:
        async input => {
          observed =
            readOfflineRevivalOperationIntent(
              owner(storage)
            );

          assert.equal(
            input.requestId,
            observed.request_id
          );

          return pendingResult(
            input.reason
          );
        },
    });

    const result =
      await coordinator.enterPending(
        "death"
      );

    assert.equal(
      result.status,
      "pending"
    );

    assert.equal(
      observed.operation,
      "pending"
    );

    assert.equal(
      readOfflineRevivalOperationIntent(
        owner(storage)
      ),
      null
    );
  }
);

test(
  "reload replays exact pending request ID",
  async () => {
    const storage =
      makeStorage();

    const seen = [];

    const first = create({
      storage,
      markPending:
        async input => {
          seen.push(
            input.requestId
          );

          throw new Error(
            "network"
          );
        },
    });

    await assert.rejects(
      first.enterPending(
        "death"
      )
    );

    const second = create({
      storage,
      createRequestId:
        () => REQUEST_B,
      markPending:
        async input => {
          seen.push(
            input.requestId
          );

          return pendingResult(
            input.reason,
            false
          );
        },
    });

    const result =
      await second.enterPending(
        "death"
      );

    assert.equal(
      result.status,
      "pending"
    );

    assert.deepEqual(
      seen,
      [
        REQUEST_A,
        REQUEST_A,
      ]
    );

    assert.equal(
      readOfflineRevivalOperationIntent(
        owner(storage)
      ),
      null
    );
  }
);

test(
  "revive intent exists before debit HTTP",
  async () => {
    const storage =
      makeStorage();

    let observed = null;

    const coordinator = create({
      storage,
      markPending:
        async input =>
          pendingResult(
            input.reason
          ),
      applyRevival:
        async input => {
          observed =
            readOfflineRevivalOperationIntent(
              owner(storage)
            );

          assert.equal(
            input.requestId,
            observed.request_id
          );

          assert.equal(
            observed.pending_event_id,
            "9007199254740993"
          );

          return {
            applied: true,
            session_id: SESSION,
            session_status:
              "active",
            event_seq: 2,
            revive_index: 1,
            credit_cost: 1,
          };
        },
    });

    await coordinator.enterPending(
      "death"
    );

    const result =
      await coordinator.revive();

    assert.equal(
      result.status,
      "resumed"
    );

    assert.equal(
      readOfflineRevivalOperationIntent(
        owner(storage)
      ),
      null
    );
  }
);

test(
  "ambiguous revive failure retains durable intent",
  async () => {
    const storage =
      makeStorage();

    const coordinator = create({
      storage,
      markPending:
        async input =>
          pendingResult(
            input.reason
          ),
      applyRevival:
        async () => {
          throw new Error(
            "network"
          );
        },
    });

    await coordinator.enterPending(
      "death"
    );

    await assert.rejects(
      coordinator.revive()
    );

    const intent =
      readOfflineRevivalOperationIntent(
        owner(storage)
      );

    assert.equal(
      intent.operation,
      "revive"
    );

    assert.equal(
      intent.request_id,
      REQUEST_A
    );
  }
);

test(
  "unverified pending reconstruction fails closed",
  () => {
    assert.throws(
      () =>
        createOfflineRevivalDurableCoordinator({
          ...owner(
            makeStorage()
          ),
          eventSeq: 1,
          revivesUsed: 0,
          initialStatus:
            "revive_pending",
          initialPendingEventId:
            "42",
          initialPendingReason:
            "death",
          createRequestId:
            () => REQUEST_A,
          markPending:
            async () => {},
          applyRevival:
            async () => {},
        }),
      {
        code:
          "REVIVAL_DURABLE_RECOVERY_REQUIRED",
      }
    );
  }
);
