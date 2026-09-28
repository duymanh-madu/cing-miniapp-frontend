import test from "node:test";
import assert from "node:assert/strict";

import {
  readOfflineRevivalOperationIntent as read,
  ensureOfflineRevivalOperationIntent as ensure,
  clearOfflineRevivalOperationIntent as clear,
} from "../offlineRevivalOperationIntent.js";

const SESSION =
  "11111111-1111-4111-8111-111111111111";

const REQUEST =
  "22222222-2222-4222-8222-222222222222";

function storage() {
  const rows = new Map();

  return {
    getItem: key => rows.get(key) ?? null,
    setItem: (key, value) => {
      rows.set(key, value);
    },
    removeItem: key => {
      rows.delete(key);
    },
  };
}

function args(store, overrides = {}) {
  return {
    storage: store,
    userId: "member-A",
    gameKey: "black-pearl-rush",
    sessionId: SESSION,
    operation: "pending",
    expectedEventSeq: 0,
    reason: "death",
    createRequestId: () => REQUEST,
    ...overrides,
  };
}

test("pending intent persists before POST", () => {
  const store = storage();
  const intent = ensure(args(store));

  assert.equal(intent.request_id, REQUEST);
  assert.equal(
    read(args(store)).request_id,
    REQUEST
  );
});

test("reload reuses exact request ID", () => {
  const store = storage();
  ensure(args(store));

  const replay = ensure(
    args(store, {
      createRequestId: () => {
        throw new Error("must not generate");
      },
    })
  );

  assert.equal(replay.request_id, REQUEST);
});

test("revive intent preserves bigint event ID", () => {
  const store = storage();

  const intent = ensure(
    args(store, {
      operation: "revive",
      expectedEventSeq: 3,
      reason: null,
      pendingEventId: "9007199254740993",
    })
  );

  assert.equal(
    intent.pending_event_id,
    "9007199254740993"
  );
});

test("different member cannot inherit intent", () => {
  const store = storage();
  ensure(args(store));

  assert.throws(
    () => read(
      args(store, {
        userId: "member-B",
      })
    ),
    {
      code: "REVIVAL_INTENT_OWNER_CONFLICT",
    }
  );
});

test("different operation cannot overwrite intent", () => {
  const store = storage();
  ensure(args(store));

  assert.throws(
    () => ensure(
      args(store, {
        operation: "revive",
        expectedEventSeq: 1,
        reason: null,
        pendingEventId: "42",
      })
    ),
    {
      code: "REVIVAL_INTENT_OPERATION_CONFLICT",
    }
  );
});

test("storage failure rejects before mutation", () => {
  const store = storage();

  store.setItem = () => {
    throw new Error("storage unavailable");
  };

  assert.throws(
    () => ensure(args(store)),
    {
      code: "REVIVAL_INTENT_STORAGE_FAILED",
    }
  );
});

test("clear requires matching request ID", () => {
  const store = storage();
  ensure(args(store));

  assert.throws(
    () => clear(
      args(store, {
        requestId: SESSION,
      })
    ),
    {
      code: "REVIVAL_INTENT_CLEAR_CONFLICT",
    }
  );

  assert.equal(
    clear(
      args(store, {
        requestId: REQUEST,
      })
    ),
    true
  );

  assert.equal(
    read(args(store)),
    null
  );
});
