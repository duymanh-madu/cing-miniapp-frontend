import test from "node:test";
import assert from "node:assert/strict";

import {
  readOfflineRevivalStartIntent,
  ensureOfflineRevivalStartIntent,
  authorizeOfflineRevivalStartIntent,
  clearOfflineRevivalStartIntent,
} from "../offlineRevivalStartIntent.js";

const owner = "0912345678";
const otherOwner = "0999999999";
const gameKey = "cing-stack-tower";

const sessionId =
  "22222222-2222-4222-8222-222222222222";

function memoryStorage() {
  const data = new Map();

  return {
    getItem(key) {
      return data.has(key)
        ? data.get(key)
        : null;
    },

    setItem(key, value) {
      data.set(key, value);
    },

    removeItem(key) {
      data.delete(key);
    },

    dump() {
      return [...data.entries()];
    },
  };
}

function args(storage) {
  return {
    userId: owner,
    gameKey,
    storage,
  };
}

test(
  "request ID is persisted before POST",
  () => {
    const storage =
      memoryStorage();

    const intent =
      ensureOfflineRevivalStartIntent(
        args(storage)
      );

    assert.match(
      intent.request_id,
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );

    assert.equal(
      intent.status,
      "start_pending"
    );

    assert.equal(
      intent.session_id,
      null
    );

    assert.equal(
      storage.dump().length,
      1
    );
  }
);

test(
  "duplicate start reuses exact request ID",
  () => {
    const storage =
      memoryStorage();

    const first =
      ensureOfflineRevivalStartIntent(
        args(storage)
      );

    const second =
      ensureOfflineRevivalStartIntent(
        args(storage)
      );

    assert.equal(
      second.request_id,
      first.request_id
    );

    assert.equal(
      storage.dump().length,
      1
    );
  }
);

test(
  "page reload retains unresolved intent",
  () => {
    const storage =
      memoryStorage();

    const first =
      ensureOfflineRevivalStartIntent(
        args(storage)
      );

    const recovered =
      readOfflineRevivalStartIntent(
        args(storage)
      );

    assert.deepEqual(
      recovered,
      first
    );
  }
);

test(
  "authorized session ID is persisted",
  () => {
    const storage =
      memoryStorage();

    const first =
      ensureOfflineRevivalStartIntent(
        args(storage)
      );

    const authorized =
      authorizeOfflineRevivalStartIntent({
        ...args(storage),
        requestId:
          first.request_id,
        sessionId,
      });

    assert.equal(
      authorized.status,
      "authorized"
    );

    assert.equal(
      authorized.session_id,
      sessionId
    );

    assert.deepEqual(
      readOfflineRevivalStartIntent(
        args(storage)
      ),
      authorized
    );
  }
);

test(
  "different session cannot replace authorized session",
  () => {
    const storage =
      memoryStorage();

    const first =
      ensureOfflineRevivalStartIntent(
        args(storage)
      );

    authorizeOfflineRevivalStartIntent({
      ...args(storage),
      requestId:
        first.request_id,
      sessionId,
    });

    assert.throws(
      () =>
        authorizeOfflineRevivalStartIntent({
          ...args(storage),
          requestId:
            first.request_id,
          sessionId:
            "33333333-3333-4333-8333-333333333333",
        }),
      {
        code:
          "OFFLINE_REVIVAL_START_MISMATCH",
      }
    );
  }
);

test(
  "different member cannot inherit or overwrite intent",
  () => {
    const storage =
      memoryStorage();

    const first =
      ensureOfflineRevivalStartIntent(
        args(storage)
      );

    assert.throws(
      () =>
        ensureOfflineRevivalStartIntent({
          userId: otherOwner,
          gameKey,
          storage,
        }),
      {
        code:
          "OFFLINE_REVIVAL_INTENT_CONFLICT",
      }
    );

    assert.equal(
      readOfflineRevivalStartIntent(
        args(storage)
      ).request_id,
      first.request_id
    );
  }
);

test(
  "different games have independent intents",
  () => {
    const storage =
      memoryStorage();

    const tower =
      ensureOfflineRevivalStartIntent(
        args(storage)
      );

    const pearl =
      ensureOfflineRevivalStartIntent({
        userId: owner,
        gameKey:
          "black-pearl-rush",
        storage,
      });

    assert.notEqual(
      tower.request_id,
      pearl.request_id
    );

    assert.equal(
      storage.dump().length,
      2
    );
  }
);

test(
  "clearing requires matching business request",
  () => {
    const storage =
      memoryStorage();

    const first =
      ensureOfflineRevivalStartIntent(
        args(storage)
      );

    assert.throws(
      () =>
        clearOfflineRevivalStartIntent({
          ...args(storage),
          requestId:
            "44444444-4444-4444-8444-444444444444",
        }),
      {
        code:
          "OFFLINE_REVIVAL_CLEAR_MISMATCH",
      }
    );

    assert.equal(
      clearOfflineRevivalStartIntent({
        ...args(storage),
        requestId:
          first.request_id,
      }),
      true
    );

    assert.equal(
      readOfflineRevivalStartIntent(
        args(storage)
      ),
      null
    );
  }
);

test(
  "corrupted persistence fails closed",
  () => {
    const storage =
      memoryStorage();

    storage.setItem(
      "cing:offline-revival:start-intent:v1:" +
        gameKey,
      "{broken-json"
    );

    assert.throws(
      () =>
        ensureOfflineRevivalStartIntent(
          args(storage)
        ),
      {
        code:
          "OFFLINE_REVIVAL_INTENT_CORRUPTED",
      }
    );
  }
);

test(
  "storage failures reject before paid start",
  () => {
    const storage = {
      getItem() {
        return null;
      },

      setItem() {
        throw new Error(
          "Storage unavailable"
        );
      },

      removeItem() {},
    };

    assert.throws(
      () =>
        ensureOfflineRevivalStartIntent(
          args(storage)
        ),
      {
        code:
          "OFFLINE_REVIVAL_STORAGE_UNAVAILABLE",
      }
    );
  }
);
