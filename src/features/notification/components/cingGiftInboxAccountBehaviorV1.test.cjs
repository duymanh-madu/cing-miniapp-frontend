"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const esbuild = require("esbuild");

const source = fs.readFileSync(
  path.join(__dirname, "CingGiftInboxV2.jsx"),
  "utf8"
);

const renderBoundary =
  "  return (\n    <section style={panelStyle}>";

assert.equal(
  source.split(renderBoundary).length,
  2,
  "Gift Inbox render boundary must be unique"
);

assert.match(
  source,
  /CING_GIFT_INBOX_ACCOUNT_FENCE_V1/
);

/*
 * Expose component-local callbacks in test memory
 * only. The application source is never modified.
 */
const instrumented = source.replace(
  renderBoundary,
  [
    "  globalThis.__giftBehavior = {",
    "    load,",
    "    readGift,",
    "    captureSession,",
    "    isCurrentSession,",
    "  };",
    renderBoundary,
  ].join("\n")
);

const compiled = esbuild.transformSync(
  instrumented,
  {
    loader: "jsx",
    format: "cjs",
    jsx: "automatic",
    target: "es2020",
  }
).code;

const A = "0912345678";
const B = "0987654321";

function deferred() {
  let resolve;
  let reject;

  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });

  return {
    promise,
    resolve,
    reject,
  };
}

async function flush() {
  for (let i = 0; i < 12; i += 1) {
    await Promise.resolve();
  }
}

function gift(id, owner, read = false) {
  return {
    id: String(id),
    user_id: owner,
    type: "gift_received",
    title: "Quà tặng Cing",
    is_read: read,
    metadata: {
      source: "cing_game_gift_purchase_v1",
      gift_purchase_id:
        `00000000-0000-4000-8000-${String(id).padStart(12, "0")}`,
      charm: 1,
    },
  };
}

function response(items) {
  return {
    data: {
      success: true,
      data: items,
    },
  };
}

function makeHarness(initialPhone = A) {
  const getCalls = [];
  const postCalls = [];
  const additions = [];
  const reads = [];

  const identitySubscribers = new Set();

  let phone = initialPhone;

  const identity = {
    getState() {
      return {
        identity: {
          phone,
        },
      };
    },

    subscribe(callback) {
      identitySubscribers.add(callback);

      return () => {
        identitySubscribers.delete(callback);
      };
    },
  };

  const storeState = {
    ownerPhone: phone,

    addNotification(notification) {
      additions.push({
        owner: storeState.ownerPhone,
        notification,
      });
    },

    markGiftNotificationRead(receipt) {
      reads.push({
        owner: storeState.ownerPhone,
        receipt,
      });
    },
  };

  const notificationStore = selector =>
    selector(storeState);

  notificationStore.getState = () =>
    storeState;

  const api = {
    get(url) {
      const pending = deferred();

      getCalls.push({
        url,
        ...pending,
      });

      return pending.promise;
    },

    post(url) {
      const pending = deferred();

      postCalls.push({
        url,
        ...pending,
      });

      return pending.promise;
    },
  };

  const slots = [];
  const pendingEffects = [];

  let cursor = 0;

  const sameDeps = (a, b) =>
    Boolean(
      a &&
      b &&
      a.length === b.length &&
      a.every(
        (value, index) =>
          Object.is(value, b[index])
      )
    );

  const react = {
    useState(initial) {
      const index = cursor++;

      if (!(index in slots)) {
        slots[index] = {
          kind: "state",
          value:
            typeof initial === "function"
              ? initial()
              : initial,
        };
      }

      return [
        slots[index].value,
        next => {
          const old = slots[index].value;

          slots[index].value =
            typeof next === "function"
              ? next(old)
              : next;
        },
      ];
    },

    useRef(initial) {
      const index = cursor++;

      if (!(index in slots)) {
        slots[index] = {
          kind: "ref",
          value: {
            current: initial,
          },
        };
      }

      return slots[index].value;
    },

    useCallback(callback, deps) {
      const index = cursor++;
      const previous = slots[index];

      if (
        !previous ||
        !sameDeps(previous.deps, deps)
      ) {
        slots[index] = {
          kind: "callback",
          value: callback,
          deps,
        };
      }

      return slots[index].value;
    },

    useEffect(effect, deps) {
      const index = cursor++;
      const previous = slots[index];

      if (
        previous &&
        sameDeps(previous.deps, deps)
      ) {
        return;
      }

      pendingEffects.push(() => {
        previous?.cleanup?.();

        const cleanup = effect();

        slots[index] = {
          kind: "effect",
          deps,
          cleanup,
        };
      });
    },
  };

  const jsxRuntime = {
    jsx: (type, props) => ({
      type,
      props,
    }),

    jsxs: (type, props) => ({
      type,
      props,
    }),

    Fragment: "Fragment",
  };

  const fakeModules = {
    react: react,

    "react/jsx-runtime":
      jsxRuntime,

    "@/infra/api/apiClient": {
      __esModule: true,
      default: api,
    },

    "@/stores/notification/notificationStore": {
      __esModule: true,
      default: notificationStore,
    },

    "@/runtime/customer/runtimeCustomerIdentityStore": {
      useRuntimeCustomerIdentityStore:
        identity,
    },

    "@/stores/notification/cingGiftNotificationIdentity": {
      isCingGameGiftNotification(value) {
        return (
          value?.type === "gift_received" &&
          value?.metadata?.source ===
            "cing_game_gift_purchase_v1"
        );
      },

      deduplicateGiftNotifications(values) {
        const seen = new Set();

        return values.filter(value => {
          const id = String(value.id);

          if (seen.has(id)) {
            return false;
          }

          seen.add(id);
          return true;
        });
      },
    },
  };

  const module = {
    exports: {},
  };

  const sandbox = {
    module,
    exports: module.exports,

    require(name) {
      if (
        !Object.prototype.hasOwnProperty.call(
          fakeModules,
          name
        )
      ) {
        throw Error(
          `UNEXPECTED_IMPORT:${name}`
        );
      }

      return fakeModules[name];
    },

    console,

    __giftBehavior: null,
  };

  vm.runInNewContext(
    compiled,
    sandbox,
    {
      filename:
        "CingGiftInboxV2.behavior.cjs",
    }
  );

  const Component =
    module.exports.default;

  assert.equal(
    typeof Component,
    "function"
  );

  function render(propPhone = phone) {
    cursor = 0;

    Component({
      phone: propPhone,
    });

    while (pendingEffects.length) {
      pendingEffects.shift()();
    }

    return sandbox.__giftBehavior;
  }

  function changePhone(next) {
    phone = next;
    storeState.ownerPhone = next;

    for (
      const subscriber
      of [...identitySubscribers]
    ) {
      subscriber(
        identity.getState()
      );
    }
  }

  function state() {
    return {
      items: slots[0]?.value,
      loading: slots[1]?.value,
      error: slots[2]?.value,
      readingId: slots[3]?.value,
    };
  }

  function unmount() {
    for (const slot of slots) {
      if (
        slot?.kind === "effect"
      ) {
        slot.cleanup?.();
      }
    }
  }

  return {
    render,
    changePhone,
    state,
    unmount,
    getCalls,
    postCalls,
    additions,
    reads,
  };
}

test(
  "late A GET cannot enter B Gift Inbox or Store",
  async () => {
    const h = makeHarness();

    h.render(A);

    assert.equal(
      h.getCalls.length,
      1
    );

    h.changePhone(B);
    h.render(B);

    assert.equal(
      h.getCalls.length,
      2
    );

    h.getCalls[0].resolve(
      response([
        gift(11, A),
      ])
    );

    await flush();

    assert.equal(
      h.state().items.length,
      0
    );

    assert.equal(
      h.additions.length,
      0
    );

    h.getCalls[1].resolve(
      response([
        gift(22, B),
      ])
    );

    await flush();

    assert.deepEqual(
      Array.from(
        h.state().items,
        item => String(item.id)
      ),
      ["22"]
    );

    assert.equal(
      h.additions.length,
      1
    );

    assert.equal(
      h.additions[0].owner,
      B
    );

    h.unmount();
  }
);

test(
  "A to B to A rejects the original A response",
  async () => {
    const h = makeHarness();

    h.render(A);

    h.changePhone(B);
    h.render(B);

    h.changePhone(A);
    h.render(A);

    assert.equal(
      h.getCalls.length,
      3
    );

    h.getCalls[0].resolve(
      response([
        gift(31, A),
      ])
    );

    await flush();

    assert.equal(
      h.additions.length,
      0
    );

    h.getCalls[2].resolve(
      response([
        gift(33, A),
      ])
    );

    await flush();

    assert.deepEqual(
      Array.from(
        h.state().items,
        item => String(item.id)
      ),
      ["33"]
    );

    h.getCalls[1].resolve(
      response([
        gift(32, B),
      ])
    );

    await flush();

    assert.deepEqual(
      Array.from(
        h.state().items,
        item => String(item.id)
      ),
      ["33"]
    );

    h.unmount();
  }
);

test(
  "older refresh cannot overwrite newer refresh",
  async () => {
    const h = makeHarness();

    h.render(A);

    const actions = h.render(A);

    const latest =
      actions.load();

    assert.equal(
      h.getCalls.length,
      2
    );

    h.getCalls[1].resolve(
      response([
        gift(42, A),
      ])
    );

    await latest;
    await flush();

    h.getCalls[0].resolve(
      response([
        gift(41, A),
      ])
    );

    await flush();

    assert.deepEqual(
      Array.from(
        h.state().items,
        item => String(item.id)
      ),
      ["42"]
    );

    assert.deepEqual(
      h.additions.map(
        entry =>
          String(entry.notification.id)
      ),
      ["42"]
    );

    h.unmount();
  }
);

test(
  "late A mark-read cannot mutate B or replay in A",
  async () => {
    const h = makeHarness();

    const actionsA =
      h.render(A);

    h.getCalls[0].resolve(
      response([
        gift(51, A),
      ])
    );

    await flush();

    const pendingRead =
      actionsA.readGift(
        h.state().items[0]
      );

    assert.equal(
      h.postCalls.length,
      1
    );

    h.changePhone(B);
    h.render(B);

    h.changePhone(A);
    h.render(A);

    h.postCalls[0].resolve({
      data: {
        success: true,
        data: {
          id: "51",
          is_read: true,
        },
      },
    });

    await pendingRead;
    await flush();

    assert.equal(
      h.reads.length,
      0
    );

    assert.equal(
      h.state().readingId,
      null
    );

    h.getCalls[2].resolve(
      response([
        gift(53, A),
      ])
    );

    await flush();

    assert.deepEqual(
      Array.from(
        h.state().items,
        item => String(item.id)
      ),
      ["53"]
    );

    h.unmount();
  }
);

test(
  "current-owner confirmed mark-read updates Gift",
  async () => {
    const h = makeHarness();

    const actions =
      h.render(A);

    h.getCalls[0].resolve(
      response([
        gift(61, A),
      ])
    );

    await flush();

    const pendingRead =
      actions.readGift(
        h.state().items[0]
      );

    assert.equal(
      h.postCalls.length,
      1
    );

    assert.match(
      h.postCalls[0].url,
      /\/61\/read$/
    );

    h.postCalls[0].resolve({
      data: {
        success: true,
        data: {
          id: "61",
          is_read: true,
        },
      },
    });

    await pendingRead;
    await flush();

    assert.equal(
      h.state().items[0].is_read,
      true
    );

    assert.equal(
      h.reads.length,
      1
    );

    assert.equal(
      h.reads[0].owner,
      A
    );

    assert.equal(
      h.reads[0].receipt.id,
      "61"
    );

    assert.equal(
      h.state().readingId,
      null
    );

    h.unmount();
  }
);
