"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const SOURCE = fs.readFileSync(
  path.join(__dirname, "notificationStore.js"),
  "utf8"
);

const A = "0912345678";
const B = "0987654321";

function deferred() {
  let resolve;
  let reject;

  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });

  return { promise, resolve, reject };
}

async function until(predicate) {
  for (let i = 0; i < 40; i += 1) {
    if (predicate()) return;
    await Promise.resolve();
  }

  throw new Error("BEHAVIORAL_WAIT_TIMEOUT");
}

function notification(id, userId) {
  return {
    id,
    user_id: userId,
    title: "Notification " + id,
    message: "Account-scoped test",
    type: "system",
    created_at: new Date().toISOString(),
    read: false,
  };
}

function harness({
  holdStorageFor = "",
  initialStorage = {},
} = {}) {
  let identity = { phone: "" };
  const listeners = [];

  const storage = {
    ...initialStorage,
  };

  const storageGate = deferred();

  const reads = [];
  const writes = [];
  const gets = [];
  const posts = [];
  const timers = [];

  const pendingHTTP = new Map();

  function create(initializer) {
    let state;
    const subscribers = new Set();

    const get = () => state;

    const set = patch => {
      state = {
        ...state,
        ...patch,
      };

      for (const fn of subscribers) {
        fn(state);
      }
    };

    state = initializer(set, get);

    return {
      getState: get,
      subscribe(fn) {
        subscribers.add(fn);

        return () => {
          subscribers.delete(fn);
        };
      },
    };
  }

  const identityStore = {
    getState() {
      return {
        identity,
      };
    },

    subscribe(fn) {
      listeners.push(fn);
    },
  };

  const zmp = {
    async getStorage({ keys }) {
      const key = keys[0];

      reads.push(key);

      if (
        key ===
        "cing_notifs_v2_" + holdStorageFor
      ) {
        await storageGate.promise;
      }

      return {
        data: {
          [key]: storage[key],
        },
      };
    },

    async setStorage({ data }) {
      const key = Object.keys(data)[0];

      storage[key] = data[key];

      writes.push(key);
    },
  };

  const apiClient = {
    get(url) {
      gets.push(url);

      const request = deferred();

      pendingHTTP.set(url, request);

      return request.promise;
    },

    async post(url, payload) {
      posts.push({
        url,
        payload,
      });

      return {
        data: {
          success: true,
        },
      };
    },
  };

  let executable = SOURCE;

  const imports = [
    /^import \{ create \} from "zustand";\s*/m,
    /^import apiClient from "@\/infra\/api\/apiClient";\s*/m,
    /^import \{ useRuntimeCustomerIdentityStore \} from "@\/runtime\/customer\/runtimeCustomerIdentityStore";\s*/m,
    /^import \{[\s\S]*?\} from "\.\/cingGiftNotificationIdentity";\s*/m,
  ];

  for (const pattern of imports) {
    assert.match(executable, pattern);

    executable =
      executable.replace(pattern, "");
  }

  executable = executable.replace(
    /^const API_BASE = .*;\s*$/m,
    ""
  );

  executable = executable.replace(
    /import\("zmp-sdk"\)/g,
    "Promise.resolve(__zmp)"
  );

  executable = executable.replace(
    "export default useNotificationStore;",
    "module.exports = useNotificationStore;"
  );

  assert.doesNotMatch(
    executable,
    /^import /m
  );

  const moduleObject = {
    exports: {},
  };

  vm.runInNewContext(
    executable,
    {
      module: moduleObject,
      exports: moduleObject.exports,
      create,
      apiClient,
      useRuntimeCustomerIdentityStore:
        identityStore,

      isCingGameGiftNotification(n) {
        return (
          n?.type === "gift_received" &&
          n?.metadata?.source ===
            "cing_game_gift_purchase_v1"
        );
      },

      addGiftNotificationOnce(items, incoming) {
        return {
          notifications: [
            ...items,
            incoming,
          ],
        };
      },

      deduplicateGiftNotifications(items) {
        return items;
      },

      __zmp: zmp,
      Date,
      Promise,

      setTimeout(callback) {
        timers.push(callback);

        return timers.length;
      },

      console,
    },
    {
      filename: "notificationStore.js",
    }
  );

  const store = moduleObject.exports;

  function setPhone(phone) {
    identity = { phone };

    for (const fn of listeners) {
      fn({
        identity,
      });
    }
  }

  function respond(phone, rows) {
    const url =
      "/profile-update/notifications/" +
      phone;

    const request =
      pendingHTTP.get(url);

    assert.ok(
      request,
      "expected HTTP request: " + url
    );

    request.resolve({
      data: {
        data: rows,
      },
    });
  }

  return {
    store,
    storage,
    storageGate,
    reads,
    writes,
    gets,
    posts,
    timers,
    setPhone,
    respond,
  };
}

test(
  "A to B clears visible notifications immediately",
  () => {
    const h = harness();

    h.setPhone(A);

    h.store
      .getState()
      .addNotification(
        notification(1, A)
      );

    assert.equal(
      h.store.getState()
        .notifications.length,
      1
    );

    h.setPhone(B);

    assert.equal(
      h.store.getState().ownerPhone,
      B
    );

    assert.equal(
      h.store.getState()
        .notifications.length,
      0
    );

    assert.equal(
      h.store.getState().unread,
      0
    );
  }
);

test(
  "late HTTP response from A cannot enter B",
  async () => {
    const h = harness();

    h.setPhone(A);

    const loadingA =
      h.store.getState().load(A);

    await until(
      () => h.gets.includes(
        "/profile-update/notifications/" +
        A
      )
    );

    h.setPhone(B);

    const loadingB =
      h.store.getState().load(B);

    await until(
      () => h.gets.includes(
        "/profile-update/notifications/" +
        B
      )
    );

    h.respond(
      B,
      [notification(22, B)]
    );

    await loadingB;

    h.respond(
      A,
      [notification(11, A)]
    );

    await loadingA;

    const state =
      h.store.getState();

    assert.equal(
      state.ownerPhone,
      B
    );

    assert.deepEqual(
      Array.from(
        state.notifications,
        n => n.id
      ),
      [22]
    );

    assert.equal(
      state.unread,
      1
    );
  }
);

test(
  "late storage response from A cannot enter B",
  async () => {
    const keyA =
      "cing_notifs_v2_" + A;

    const h = harness({
      holdStorageFor: A,

      initialStorage: {
        [keyA]: JSON.stringify({
          owner: A,
          notifications: [
            notification(33, A),
          ],
        }),
      },
    });

    h.setPhone(A);

    const loadingA =
      h.store.getState().load(A);

    await until(
      () => h.reads.includes(keyA)
    );

    h.setPhone(B);

    const loadingB =
      h.store.getState().load(B);

    await until(
      () => h.gets.includes(
        "/profile-update/notifications/" +
        B
      )
    );

    h.respond(
      B,
      [notification(44, B)]
    );

    await loadingB;

    h.storageGate.resolve();

    await loadingA;

    assert.deepEqual(
      Array.from(
        h.store.getState().notifications,
        n => n.id
      ),
      [44]
    );

    assert.equal(
      h.gets.includes(
        "/profile-update/notifications/" +
        A
      ),
      false
    );
  }
);

test(
  "wrong-recipient notification cannot enter B",
  () => {
    const h = harness();

    h.setPhone(B);

    h.store
      .getState()
      .addNotification(
        notification(55, A)
      );

    assert.equal(
      h.store.getState()
        .notifications.length,
      0
    );
  }
);

test(
  "A delayed mark-read does not run after B login",
  async () => {
    const h = harness();

    h.setPhone(A);

    const loadingA =
      h.store.getState().load(A);

    await until(
      () => h.gets.includes(
        "/profile-update/notifications/" +
        A
      )
    );

    h.respond(
      A,
      [notification(66, A)]
    );

    await loadingA;

    assert.equal(
      h.timers.length,
      1
    );

    h.setPhone(B);

    await h.timers[0]();

    assert.equal(
      h.posts.length,
      0
    );
  }
);

test(
  "ownerless legacy storage is never restored",
  async () => {
    const h = harness({
      initialStorage: {
        cing_notifs_v1:
          JSON.stringify({
            notifications: [
              notification(77, A),
            ],
          }),
      },
    });

    h.setPhone(B);

    const loading =
      h.store.getState().load(B);

    await until(
      () => h.gets.includes(
        "/profile-update/notifications/" +
        B
      )
    );

    h.respond(B, []);

    await loading;

    assert.equal(
      h.reads.includes(
        "cing_notifs_v1"
      ),
      false
    );

    assert.equal(
      h.store.getState()
        .notifications.length,
      0
    );
  }
);
