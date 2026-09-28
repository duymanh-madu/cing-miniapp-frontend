"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const esbuild = require("esbuild");

const directory = __dirname;

const source = fs.readFileSync(
  path.join(
    directory,
    "CingGameGiftPurchaseV2.jsx"
  ),
  "utf8"
);

const authoritySource = fs.readFileSync(
  path.join(
    directory,
    "cingGameGiftPurchaseV2Authority.js"
  ),
  "utf8"
);

const boundary =
  "  return (\n    <div style={surface}>";

assert.equal(
  source.split(boundary).length,
  2,
  "Gift component render boundary must be unique"
);

const instrumented = source.replace(
  boundary,
  [
    "  globalThis.__giftActions = {",
    "    purchase,",
    "    setGiftId,",
    "    setFunding,",
    "    setConfirming,",
    "    capture,",
    "  };",
    boundary,
  ].join("\n")
);

const componentCode =
  esbuild.transformSync(
    instrumented,
    {
      loader: "jsx",
      format: "cjs",
      jsx: "automatic",
      target: "es2020",
    }
  ).code;

const authorityCode =
  esbuild.transformSync(
    authoritySource,
    {
      format: "cjs",
      target: "es2020",
    }
  ).code;

const A = "0912345678";
const B = "0987654321";
const C = "0901234567";

const REQUEST_ID =
  "11111111-1111-4111-8111-111111111111";

const LEDGER_ID =
  "22222222-2222-4222-8222-222222222222";

const gift = {
  id: "tra_sen",
  name: "Trà sen vàng",
  icon: "🪷",
  price_vnd: "50000",
  points_cost: "50",
  charm_award: "50",
};

function deferred() {
  let resolve;
  let reject;

  const promise = new Promise(
    (yes, no) => {
      resolve = yes;
      reject = no;
    }
  );

  return {
    promise,
    resolve,
    reject,
  };
}

async function flush() {
  for (
    let i = 0;
    i < 16;
    i += 1
  ) {
    await Promise.resolve();
  }
}

function catalogResponse(items = [gift]) {
  return {
    data: {
      success: true,
      data: items,
    },
  };
}

function walletResponse({
  sender = A,
  recipient = C,
  requestId = REQUEST_ID,
  giftId = "tra_sen",
  ledgerId = LEDGER_ID,
} = {}) {
  return {
    data: {
      success: true,
      data: {
        applied: true,
        request_id: requestId,
        sender_user_id: sender,
        recipient_user_id: recipient,
        gift_id: giftId,
        funding_source: "wallet",
        gift_name: "Trà sen vàng",
        gift_icon: "🪷",
        price_vnd: "50000",
        charm_awarded: 50,
        wallet_transaction_id: ledgerId,
        points_cost: null,
        ipos_sync_status: "not_required",
      },
    },
  };
}

function makeHarness({
  initialOwner = A,
  initialStorage = {},
} = {}) {
  let owner = initialOwner;

  const getCalls = [];
  const postCalls = [];
  const subscribers = new Set();
  const records = new Map(
    Object.entries(
      initialStorage
    )
  );

  const storage = {
    getItem(key) {
      return records.has(key)
        ? records.get(key)
        : null;
    },

    setItem(key, value) {
      records.set(
        key,
        String(value)
      );
    },

    removeItem(key) {
      records.delete(key);
    },
  };

  const identity = {
    getState() {
      return {
        identity: {
          phone: owner,
        },
      };
    },

    subscribe(callback) {
      subscribers.add(callback);

      return () => {
        subscribers.delete(
          callback
        );
      };
    },
  };

  function useIdentity(selector) {
    return selector(
      identity.getState()
    );
  }

  useIdentity.getState =
    identity.getState;

  useIdentity.subscribe =
    identity.subscribe;

  const api = {
    get(url) {
      const pending = deferred();

      getCalls.push({
        url,
        ...pending,
      });

      return pending.promise;
    },

    post(url, payload) {
      const pending = deferred();

      postCalls.push({
        url,
        payload,
        ...pending,
      });

      return pending.promise;
    },
  };

  const authorityModule = {
    exports: {},
  };

  const crypto = {
    randomUUID() {
      return REQUEST_ID;
    },
  };

  const authorityContext = {
    module: authorityModule,
    exports: authorityModule.exports,
    crypto,
  };

  vm.runInNewContext(
    authorityCode,
    authorityContext,
    {
      filename:
        "GiftAuthority.behavior.cjs",
    }
  );

  const domain =
    authorityModule.exports;

  const slots = [];
  const effects = [];

  let cursor = 0;

  function depsEqual(left, right) {
    return Boolean(
      left &&
      right &&
      left.length ===
        right.length &&
      left.every(
        (value, index) =>
          Object.is(
            value,
            right[index]
          )
      )
    );
  }

  const react = {
    useState(initial) {
      const index =
        cursor++;

      if (!(index in slots)) {
        slots[index] = {
          kind: "state",
          value:
            typeof initial ===
            "function"
              ? initial()
              : initial,
        };
      }

      return [
        slots[index].value,
        next => {
          const previous =
            slots[index].value;

          slots[index].value =
            typeof next ===
            "function"
              ? next(previous)
              : next;
        },
      ];
    },

    useRef(initial) {
      const index =
        cursor++;

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

    useEffect(effect, deps) {
      const index =
        cursor++;

      const previous =
        slots[index];

      if (
        previous &&
        depsEqual(
          previous.deps,
          deps
        )
      ) {
        return;
      }

      effects.push(() => {
        previous?.cleanup?.();

        const cleanup =
          effect();

        slots[index] = {
          kind: "effect",
          deps,
          cleanup,
        };
      });
    },
  };

  const jsxRuntime = {
    jsx(type, props) {
      return {
        type,
        props,
      };
    },

    jsxs(type, props) {
      return {
        type,
        props,
      };
    },

    Fragment: "Fragment",
  };

  const modules = {
    react,

    "react/jsx-runtime":
      jsxRuntime,

    "@/infra/api/apiClient": {
      __esModule: true,
      default: api,
    },

    "@/runtime/customer/runtimeCustomerIdentityStore": {
      useRuntimeCustomerIdentityStore:
        useIdentity,
    },

    "./cingGameGiftPurchaseV2Authority":
      domain,
  };

  const componentModule = {
    exports: {},
  };

  const context = {
    module: componentModule,
    exports:
      componentModule.exports,

    require(name) {
      if (
        !Object.prototype.hasOwnProperty.call(
          modules,
          name
        )
      ) {
        throw new Error(
          "UNEXPECTED_IMPORT:" +
            name
        );
      }

      return modules[name];
    },

    crypto,
    sessionStorage: storage,

    console,

    __giftActions: null,
  };

  vm.runInNewContext(
    componentCode,
    context,
    {
      filename:
        "CingGameGiftPurchaseV2.behavior.cjs",
    }
  );

  const Component =
    componentModule.exports.default;

  assert.equal(
    typeof Component,
    "function"
  );

  function render(
    recipient = C
  ) {
    cursor = 0;

    Component({
      recipientUserId:
        recipient,

      recipientName:
        "Người nhận",

      onClose() {},
    });

    while (
      effects.length > 0
    ) {
      effects.shift()();
    }

    return context.__giftActions;
  }

  function switchOwner(next) {
    owner = next;

    for (
      const callback
      of [...subscribers]
    ) {
      callback(
        identity.getState()
      );
    }
  }

  function state() {
    return {
      catalog:
        slots[0]?.value,

      loading:
        slots[1]?.value,

      giftId:
        slots[2]?.value,

      funding:
        slots[3]?.value,

      confirming:
        slots[4]?.value,

      busy:
        slots[5]?.value,

      error:
        slots[6]?.value,

      receipt:
        slots[7]?.value,

      pending:
        slots[8]?.value,

      intentUnavailable:
        slots[9]?.value,
    };
  }

  function selectGift() {
    const actions =
      render(C);

    actions.setGiftId(
      "tra_sen"
    );

    return render(C);
  }

  function unmount() {
    for (
      const slot
      of slots
    ) {
      if (
        slot?.kind ===
        "effect"
      ) {
        slot.cleanup?.();
      }
    }
  }

  return {
    render,
    switchOwner,
    selectGift,
    unmount,
    state,
    storage,
    records,
    getCalls,
    postCalls,
  };
}

test(
  "unknown HTTP result retries same saved request_id",
  async () => {
    const h =
      makeHarness();

    h.render();

    h.getCalls[0].resolve(
      catalogResponse()
    );

    await flush();

    const actions =
      h.selectGift();

    const first =
      actions.purchase();

    assert.equal(
      h.postCalls.length,
      1
    );

    assert.equal(
      h.postCalls[0]
        .payload.request_id,
      REQUEST_ID
    );

    h.postCalls[0].reject(
      new Error(
        "NETWORK_UNCERTAIN"
      )
    );

    await first;
    await flush();

    assert.equal(
      h.state().pending
        .requestId,
      REQUEST_ID
    );

    const retryActions =
      h.render();

    const retry =
      retryActions.purchase();

    assert.equal(
      h.postCalls.length,
      2
    );

    assert.equal(
      h.postCalls[1]
        .payload.request_id,
      REQUEST_ID
    );

    h.postCalls[1].resolve(
      walletResponse()
    );

    await retry;
    await flush();

    assert.equal(
      h.state().receipt
        .request_id,
      REQUEST_ID
    );

    assert.equal(
      h.state().pending,
      null
    );

    assert.equal(
      h.records.size,
      0
    );

    h.unmount();
  }
);

test(
  "corrupt stored intent fails closed before POST",
  async () => {
    const key =
      "cing_game_gift_purchase_v2_" +
      A;

    const h = makeHarness({
      initialStorage: {
        [key]:
          '{"sender":"corrupt"}',
      },
    });

    h.render();

    h.getCalls[0].resolve(
      catalogResponse()
    );

    await flush();

    const actions =
      h.selectGift();

    assert.equal(
      h.state()
        .intentUnavailable,
      true
    );

    await actions.purchase();

    assert.equal(
      h.postCalls.length,
      0
    );

    assert.equal(
      h.records.get(key),
      '{"sender":"corrupt"}'
    );

    h.unmount();
  }
);

test(
  "late A receipt cannot confirm or unlock B purchase",
  async () => {
    const h =
      makeHarness();

    h.render();

    h.getCalls[0].resolve(
      catalogResponse()
    );

    await flush();

    const actionsA =
      h.selectGift();

    const purchaseA =
      actionsA.purchase();

    assert.equal(
      h.postCalls.length,
      1
    );

    h.switchOwner(B);
    h.render(C);

    h.getCalls[1].resolve(
      catalogResponse()
    );

    await flush();

    const actionsB =
      h.selectGift();

    const purchaseB =
      actionsB.purchase();

    assert.equal(
      h.postCalls.length,
      2
    );

    h.postCalls[0].resolve(
      walletResponse({
        sender: A,
      })
    );

    await purchaseA;
    await flush();

    assert.equal(
      h.state().receipt,
      null
    );

    assert.equal(
      h.state().busy,
      true
    );

    const again =
      h.render(C);

    await again.purchase();

    assert.equal(
      h.postCalls.length,
      2
    );

    h.postCalls[1].resolve(
      walletResponse({
        sender: B,
      })
    );

    await purchaseB;
    await flush();

    assert.equal(
      h.state().receipt
        .sender_user_id,
      B
    );

    assert.equal(
      h.state().busy,
      false
    );

    assert.equal(
      h.records.has(
        "cing_game_gift_purchase_v2_" +
          A
      ),
      true
    );

    h.unmount();
  }
);

test(
  "A-B-A rejects catalog response from old A session",
  async () => {
    const h =
      makeHarness();

    h.render();

    h.switchOwner(B);
    h.render(C);

    h.switchOwner(A);
    h.render(C);

    assert.equal(
      h.getCalls.length,
      3
    );

    h.getCalls[2].resolve(
      catalogResponse([
        {
          ...gift,
          id:
            "new_catalog",
        },
      ])
    );

    await flush();

    h.getCalls[0].resolve(
      catalogResponse([
        {
          ...gift,
          id:
            "old_catalog",
        },
      ])
    );

    await flush();

    assert.equal(
      h.state().catalog[0].id,
      "new_catalog"
    );

    h.getCalls[1].resolve(
      catalogResponse([
        {
          ...gift,
          id:
            "wrong_owner",
        },
      ])
    );

    await flush();

    assert.equal(
      h.state().catalog[0].id,
      "new_catalog"
    );

    h.unmount();
  }
);

test(
  "invalid receipt keeps unresolved intent",
  async () => {
    const h =
      makeHarness();

    h.render();

    h.getCalls[0].resolve(
      catalogResponse()
    );

    await flush();

    const actions =
      h.selectGift();

    const purchase =
      actions.purchase();

    h.postCalls[0].resolve(
      walletResponse({
        giftId:
          "wrong_gift",
      })
    );

    await purchase;
    await flush();

    assert.equal(
      h.state().receipt,
      null
    );

    assert.equal(
      h.state().pending
        .requestId,
      REQUEST_ID
    );

    assert.equal(
      h.records.size,
      1
    );

    h.unmount();
  }
);
