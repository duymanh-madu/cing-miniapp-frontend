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

const userId =
  "0912345678";

const gameKey =
  "cing-stack-tower";

const OLD_SESSION =
  "22222222-2222-4222-8222-222222222222";

const NEW_SESSION =
  "33333333-3333-4333-8333-333333333333";

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

function activeSession(
  sessionId,
  applied = true
) {
  return {
    applied,
    session_id:
      sessionId,
    game_key:
      gameKey,
    session_status:
      "active",
    event_seq: 0,
    revives_used: 0,
  };
}

function makeCoordinator({
  storage,
  startSession,
  recoverSession,
  abandonSession,
}) {
  return createOfflineRevivalStartCoordinator({
    storage,
    startSession,
    recoverSession,
    abandonSession,
  });
}

test(
  "fresh start has exactly one session POST",
  async () => {
    const storage =
      memoryStorage();

    let starts = 0;
    let recoveries = 0;
    let abandons = 0;

    const coordinator =
      makeCoordinator({
        storage,

        startSession:
          async () => {
            starts += 1;

            return activeSession(
              NEW_SESSION,
              true
            );
          },

        recoverSession:
          async () => {
            recoveries += 1;

            throw new Error(
              "unexpected recovery"
            );
          },

        abandonSession:
          async () => {
            abandons += 1;

            throw new Error(
              "unexpected abandon"
            );
          },
      });

    const result =
      await coordinator.begin({
        userId,
        gameKey,
      });

    assert.equal(
      result.status,
      "ready"
    );

    assert.equal(starts, 1);
    assert.equal(recoveries, 0);
    assert.equal(abandons, 0);
  }
);

test(
  "fresh response must be applied active",
  async () => {
    const storage =
      memoryStorage();

    const coordinator =
      makeCoordinator({
        storage,

        startSession:
          async () =>
            activeSession(
              NEW_SESSION,
              false
            ),

        recoverSession:
          async () => {
            throw new Error(
              "unexpected recovery"
            );
          },

        abandonSession:
          async () => {
            throw new Error(
              "unexpected abandon"
            );
          },
      });

    const result =
      await coordinator.begin({
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
  "ambiguous start failure preserves durable request ID",
  async () => {
    const storage =
      memoryStorage();

    let seen = null;

    const coordinator =
      makeCoordinator({
        storage,

        startSession:
          async ({ requestId }) => {
            seen = requestId;

            throw new Error(
              "network"
            );
          },

        recoverSession:
          async () => {
            throw new Error(
              "unexpected recovery"
            );
          },

        abandonSession:
          async () => {
            throw new Error(
              "unexpected abandon"
            );
          },
      });

    await assert.rejects(
      coordinator.begin({
        userId,
        gameKey,
      }),
      /network/
    );

    assert.equal(
      readOfflineRevivalStartIntent(
        identity(storage)
      ).request_id,
      seen
    );
  }
);

test(
  "start_pending recovery authorizes exact active session without another POST",
  async () => {
    const storage =
      memoryStorage();

    const pending =
      ensureOfflineRevivalStartIntent(
        identity(storage)
      );

    let starts = 0;
    let abandons = 0;

    const coordinator =
      makeCoordinator({
        storage,

        startSession:
          async () => {
            starts += 1;

            throw new Error(
              "must not repeat POST"
            );
          },

        recoverSession:
          async ({ requestId }) => {
            assert.equal(
              requestId,
              pending.request_id
            );

            return {
              ...activeSession(
                OLD_SESSION,
                undefined
              ),
              request_id:
                pending.request_id,
            };
          },

        abandonSession:
          async () => {
            abandons += 1;

            throw new Error(
              "must not abandon"
            );
          },
      });

    const result =
      await coordinator.begin({
        userId,
        gameKey,
      });

    assert.equal(
      result.status,
      "ready"
    );

    assert.equal(
      result.recovered,
      true
    );

    assert.equal(starts, 0);
    assert.equal(abandons, 0);

    assert.equal(
      readOfflineRevivalStartIntent(
        identity(storage)
      ).status,
      "authorized"
    );
  }
);

for (const staleStatus of [
  "active",
  "revive_pending",
]) {
  test(
    `authorized stale ${staleStatus} session is abandoned before fresh start`,
    async () => {
      const storage =
        memoryStorage();

      const pending =
        ensureOfflineRevivalStartIntent(
          identity(storage)
        );

      authorizeOfflineRevivalStartIntent({
        ...identity(storage),
        requestId:
          pending.request_id,
        sessionId:
          OLD_SESSION,
      });

      let abandons = 0;
      let starts = 0;
      let freshRequest = null;

      const coordinator =
        makeCoordinator({
          storage,

          recoverSession:
            async () => ({
              session_id:
                OLD_SESSION,
              request_id:
                pending.request_id,
              game_key:
                gameKey,
              session_status:
                staleStatus,
              event_seq:
                staleStatus ===
                  "revive_pending"
                  ? 3
                  : 2,
              revives_used: 1,
            }),

          abandonSession:
            async ({
              sessionId,
              requestId,
              expectedEventSeq,
            }) => {
              abandons += 1;

              assert.equal(
                sessionId,
                OLD_SESSION
              );

              assert.equal(
                requestId,
                pending.request_id
              );

              return {
                applied: true,
                session_id:
                  OLD_SESSION,
                session_status:
                  "abandoned",
                event_seq:
                  expectedEventSeq,
                revives_used: 1,
                abandoned_at:
                  new Date()
                    .toISOString(),
              };
            },

          startSession:
            async ({
              requestId,
            }) => {
              starts += 1;
              freshRequest =
                requestId;

              return activeSession(
                NEW_SESSION,
                true
              );
            },
        });

      const result =
        await coordinator.begin({
          userId,
          gameKey,
        });

      assert.equal(
        result.status,
        "ready"
      );

      assert.equal(abandons, 1);
      assert.equal(starts, 1);

      assert.notEqual(
        freshRequest,
        pending.request_id
      );

      assert.equal(
        result.session_id,
        NEW_SESSION
      );
    }
  );
}

for (const terminalStatus of [
  "finalized",
  "abandoned",
]) {
  test(
    `terminal ${terminalStatus} clears stale fence without abandon`,
    async () => {
      const storage =
        memoryStorage();

      const pending =
        ensureOfflineRevivalStartIntent(
          identity(storage)
        );

      authorizeOfflineRevivalStartIntent({
        ...identity(storage),
        requestId:
          pending.request_id,
        sessionId:
          OLD_SESSION,
      });

      let abandons = 0;

      const coordinator =
        makeCoordinator({
          storage,

          recoverSession:
            async () => ({
              session_id:
                OLD_SESSION,
              request_id:
                pending.request_id,
              game_key:
                gameKey,
              session_status:
                terminalStatus,
              event_seq: 2,
              revives_used: 1,
            }),

          abandonSession:
            async () => {
              abandons += 1;

              throw new Error(
                "terminal must not abandon"
              );
            },

          startSession:
            async () =>
              activeSession(
                NEW_SESSION,
                true
              ),
        });

      const result =
        await coordinator.begin({
          userId,
          gameKey,
        });

      assert.equal(
        result.status,
        "ready"
      );

      assert.equal(
        abandons,
        0
      );
    }
  );
}

test(
  "ambiguous abandon failure preserves old authorized fence",
  async () => {
    const storage =
      memoryStorage();

    const pending =
      ensureOfflineRevivalStartIntent(
        identity(storage)
      );

    authorizeOfflineRevivalStartIntent({
      ...identity(storage),
      requestId:
        pending.request_id,
      sessionId:
        OLD_SESSION,
    });

    let starts = 0;

    const coordinator =
      makeCoordinator({
        storage,

        recoverSession:
          async () => ({
            session_id:
              OLD_SESSION,
            request_id:
              pending.request_id,
            game_key:
              gameKey,
            session_status:
              "active",
            event_seq: 0,
            revives_used: 0,
          }),

        abandonSession:
          async () => {
            throw new Error(
              "network ambiguity"
            );
          },

        startSession:
          async () => {
            starts += 1;

            return activeSession(
              NEW_SESSION
            );
          },
      });

    await assert.rejects(
      coordinator.begin({
        userId,
        gameKey,
      }),
      /network ambiguity/
    );

    assert.equal(starts, 0);

    assert.equal(
      readOfflineRevivalStartIntent(
        identity(storage)
      ).request_id,
      pending.request_id
    );
  }
);

test(
  "definitively missing authorized session clears stale fence",
  async () => {
    const storage =
      memoryStorage();

    const pending =
      ensureOfflineRevivalStartIntent(
        identity(storage)
      );

    authorizeOfflineRevivalStartIntent({
      ...identity(storage),
      requestId:
        pending.request_id,
      sessionId:
        OLD_SESSION,
    });

    let freshRequest = null;

    const coordinator =
      makeCoordinator({
        storage,

        recoverSession:
          async () => {
            const error =
              new Error(
                "not found"
              );

            error.response = {
              status: 404,
              data: {
                code:
                  "REVIVAL_SESSION_NOT_FOUND",
              },
            };

            throw error;
          },

        abandonSession:
          async () => {
            throw new Error(
              "missing session must not abandon"
            );
          },

        startSession:
          async ({
            requestId,
          }) => {
            freshRequest =
              requestId;

            return activeSession(
              NEW_SESSION,
              true
            );
          },
      });

    const result =
      await coordinator.begin({
        userId,
        gameKey,
      });

    assert.equal(
      result.status,
      "ready"
    );

    assert.notEqual(
      freshRequest,
      pending.request_id
    );
  }
);

test(
  "concurrent second tap cannot create another session",
  async () => {
    const storage =
      memoryStorage();

    let release;

    const wait =
      new Promise(resolve => {
        release = resolve;
      });

    let starts = 0;

    const coordinator =
      makeCoordinator({
        storage,

        startSession:
          async () => {
            starts += 1;

            await wait;

            return activeSession(
              NEW_SESSION,
              true
            );
          },

        recoverSession:
          async () => {
            throw new Error(
              "unexpected recovery"
            );
          },

        abandonSession:
          async () => {
            throw new Error(
              "unexpected abandon"
            );
          },
      });

    const first =
      coordinator.begin({
        userId,
        gameKey,
      });

    const second =
      await coordinator.begin({
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

    assert.equal(starts, 1);
  }
);
