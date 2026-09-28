import test from "node:test";
import assert from "node:assert/strict";

import {
  createOfflineRevivalStartCoordinator,
} from "../offlineRevivalStartCoordinator.js";

import {
  ensureOfflineRevivalStartIntent,
  readOfflineRevivalStartIntent,
  authorizeOfflineRevivalStartIntent,
} from "../offlineRevivalStartIntent.js";

const userId = "0912345678";
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
  };
}

function identity(storage) {
  return {
    userId,
    gameKey,
    storage,
  };
}

function makeCoordinator(
  storage,
  startSession,
  recoverSession =
    async () => null
) {
  return createOfflineRevivalStartCoordinator({
    storage,
    startSession,
    recoverSession,
  });
}

test(
  "fresh start persists intent before POST",
  async () => {
    const storage = memoryStorage();

    let requestDuringPost;

    const controller = makeCoordinator(
      storage,
      async ({ requestId }) => {
        requestDuringPost =
          readOfflineRevivalStartIntent(
            identity(storage)
          ).request_id;

        assert.equal(
          requestId,
          requestDuringPost
        );

        return {
          applied: true,
          session_id: sessionId,
          session_status: "active",
        };
      }
    );

    const result =
      await controller.begin({
        userId,
        gameKey,
      });

    assert.equal(
      result.status,
      "ready"
    );

    assert.equal(
      result.session_id,
      sessionId
    );

    assert.equal(
      readOfflineRevivalStartIntent(
        identity(storage)
      ).status,
      "authorized"
    );
  }
);


test(
  "paid-start replay cannot open fresh gameplay",
  async () => {
    const storage = memoryStorage();

    const controller = makeCoordinator(
      storage,
      async () => ({
        applied: false,
        session_id: sessionId,
        session_status: "active",
      })
    );

    const result =
      await controller.begin({
        userId,
        gameKey,
      });

    assert.equal(
      result.status,
      "existing_session"
    );

    assert.equal(
      readOfflineRevivalStartIntent(
        identity(storage)
      ).status,
      "authorized"
    );
  }
);

test(
  "missing applied flag cannot open gameplay",
  async () => {
    const storage = memoryStorage();

    const controller = makeCoordinator(
      storage,
      async () => ({
        session_id: sessionId,
        session_status: "active",
      })
    );

    const result =
      await controller.begin({
        userId,
        gameKey,
      });

    assert.equal(
      result.status,
      "existing_session"
    );
  }
);

test(
  "fresh applied session must be active",
  async () => {
    const storage = memoryStorage();

    const controller = makeCoordinator(
      storage,
      async () => ({
        applied: true,
        session_id: sessionId,
        session_status: "revive_pending",
      })
    );

    const result =
      await controller.begin({
        userId,
        gameKey,
      });

    assert.equal(
      result.status,
      "existing_session"
    );
  }
);

test(
  "concurrent second tap cannot POST",
  async () => {
    const storage = memoryStorage();

    let calls = 0;
    let release;

    const pending = new Promise(
      (resolve) => {
        release = resolve;
      }
    );

    const controller = makeCoordinator(
      storage,
      async () => {
        calls++;
        await pending;

        return {
          applied: true,
          session_id: sessionId,
          session_status: "active",
        };
      }
    );

    const first =
      controller.begin({
        userId,
        gameKey,
      });

    const second =
      await controller.begin({
        userId,
        gameKey,
      });

    assert.equal(
      second.status,
      "busy"
    );

    release();

    assert.equal(
      (await first).status,
      "ready"
    );

    assert.equal(calls, 1);
  }
);

test(
  "ambiguous POST failure retains request ID",
  async () => {
    const storage = memoryStorage();

    let firstId;

    const controller = makeCoordinator(
      storage,
      async ({ requestId }) => {
        firstId = requestId;
        throw new Error(
          "Network timeout"
        );
      }
    );

    await assert.rejects(
      controller.begin({
        userId,
        gameKey,
      }),
      /Network timeout/
    );

    assert.equal(
      readOfflineRevivalStartIntent(
        identity(storage)
      ).request_id,
      firstId
    );
  }
);

test(
  "ambiguous retry recovers without another POST",
  async () => {
    const storage = memoryStorage();

    const existing =
      ensureOfflineRevivalStartIntent(
        identity(storage)
      );

    let starts = 0;
    let recoveredId;

    const controller = makeCoordinator(
      storage,
      async () => {
        starts++;
        throw new Error(
          "POST must not run"
        );
      },
      async ({ requestId }) => {
        recoveredId = requestId;

        return {
          applied: true,
          session_id: sessionId,
          session_status: "active",
        };
      }
    );

    const result =
      await controller.begin({
        userId,
        gameKey,
      });

    assert.equal(starts, 0);

    assert.equal(
      recoveredId,
      existing.request_id
    );

    assert.equal(
      result.status,
      "existing_session"
    );
  }
);

test(
  "definitive missing session retries same ID",
  async () => {
    const storage = memoryStorage();

    const existing =
      ensureOfflineRevivalStartIntent(
        identity(storage)
      );

    let startedId;

    const controller = makeCoordinator(
      storage,
      async ({ requestId }) => {
        startedId = requestId;

        return {
          applied: true,
          session_id: sessionId,
          session_status: "active",
        };
      },
      async () => {
        const error = new Error(
          "Not found"
        );

        error.response = {
          status: 404,
          data: {
            code:
              "REVIVAL_SESSION_NOT_FOUND",
          },
        };

        throw error;
      }
    );

    const result =
      await controller.begin({
        userId,
        gameKey,
      });

    assert.equal(
      result.status,
      "ready"
    );

    assert.equal(
      startedId,
      existing.request_id
    );
  }
);

test(
  "unknown recovery failure never starts new POST",
  async () => {
    const storage = memoryStorage();

    const existing =
      ensureOfflineRevivalStartIntent(
        identity(storage)
      );

    let starts = 0;

    const controller = makeCoordinator(
      storage,
      async () => {
        starts++;
      },
      async () => {
        throw new Error(
          "Recovery unavailable"
        );
      }
    );

    await assert.rejects(
      controller.begin({
        userId,
        gameKey,
      }),
      /Recovery unavailable/
    );

    assert.equal(starts, 0);

    assert.equal(
      readOfflineRevivalStartIntent(
        identity(storage)
      ).request_id,
      existing.request_id
    );
  }
);

test(
  "authorized session is not restarted",
  async () => {
    const storage = memoryStorage();

    const pending =
      ensureOfflineRevivalStartIntent(
        identity(storage)
      );

    authorizeOfflineRevivalStartIntent({
      ...identity(storage),
      requestId:
        pending.request_id,
      sessionId,
    });

    let starts = 0;
    let recoveries = 0;

    const controller = makeCoordinator(
      storage,
      async () => {
        starts++;
      },
      async () => {
        recoveries++;
      }
    );

    const result =
      await controller.begin({
        userId,
        gameKey,
      });

    assert.equal(
      result.status,
      "existing_session"
    );

    assert.equal(starts, 0);
    assert.equal(recoveries, 0);
  }
);

test(
  "non-active recovered session cannot open gameplay",
  async () => {
    const storage = memoryStorage();

    ensureOfflineRevivalStartIntent(
      identity(storage)
    );

    const controller = makeCoordinator(
      storage,
      async () => {
        throw new Error(
          "Unexpected POST"
        );
      },
      async () => ({
        session_id: sessionId,
        session_status: "revive_pending",
      })
    );

    const result =
      await controller.begin({
        userId,
        gameKey,
      });

    assert.equal(
      result.status,
      "existing_session"
    );
  }
);
