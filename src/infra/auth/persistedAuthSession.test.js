import test from "node:test";
import assert from "node:assert/strict";

import {
  getPersistedAuthSession,
} from "./persistedAuthSession.js";

function createMemoryLocalStorage(entries = {}) {
  const store =
    new Map(
      Object.entries(entries)
        .map(([key, value]) => [
          String(key),
          String(value),
        ])
    );

  return {
    getItem(key) {
      return store.has(String(key))
        ? store.get(String(key))
        : null;
    },

    setItem(key, value) {
      store.set(
        String(key),
        String(value)
      );
    },

    removeItem(key) {
      store.delete(
        String(key)
      );
    },

    clear() {
      store.clear();
    },
  };
}

test(
  "malformed session preserves independent access and refresh tokens",
  () => {
    globalThis.localStorage =
      createMemoryLocalStorage({
        cing_session:
          "{malformed-json",

        cing_access_token:
          "valid-access-token",

        cing_refresh_token:
          "valid-refresh-token",
      });

    assert.deepEqual(
      getPersistedAuthSession(),
      {
        session: null,
        accessToken:
          "valid-access-token",
        refreshToken:
          "valid-refresh-token",
      }
    );
  }
);

test(
  "malformed session preserves refresh-only recovery authority",
  () => {
    globalThis.localStorage =
      createMemoryLocalStorage({
        cing_session:
          "{malformed-json",

        cing_refresh_token:
          "valid-refresh-token",
      });

    assert.deepEqual(
      getPersistedAuthSession(),
      {
        session: null,
        accessToken: null,
        refreshToken:
          "valid-refresh-token",
      }
    );
  }
);

test(
  "valid session retains canonical session-token precedence",
  () => {
    globalThis.localStorage =
      createMemoryLocalStorage({
        cing_session:
          JSON.stringify({
            accessToken:
              "session-access",

            refreshToken:
              "session-refresh",

            profile: {
              id:
                "customer-test",
            },
          }),

        cing_access_token:
          "storage-access",

        cing_refresh_token:
          "storage-refresh",
      });

    assert.deepEqual(
      getPersistedAuthSession(),
      {
        session: {
          accessToken:
            "session-access",

          refreshToken:
            "session-refresh",

          profile: {
            id:
              "customer-test",
          },
        },

        accessToken:
          "session-access",

        refreshToken:
          "session-refresh",
      }
    );
  }
);

test(
  "missing session reads independent token storage",
  () => {
    globalThis.localStorage =
      createMemoryLocalStorage({
        cing_access_token:
          "storage-access",

        cing_refresh_token:
          "storage-refresh",
      });

    assert.deepEqual(
      getPersistedAuthSession(),
      {
        session: null,
        accessToken:
          "storage-access",
        refreshToken:
          "storage-refresh",
      }
    );
  }
);
