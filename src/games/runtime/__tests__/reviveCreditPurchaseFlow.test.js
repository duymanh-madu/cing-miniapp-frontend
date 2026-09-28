import test from "node:test";
import assert from "node:assert/strict";

import {
  executeReviveCreditPurchase,
} from "../reviveCreditPurchaseFlow.js";

import {
  readReviveCreditPurchaseIntent,
} from "../reviveCreditPurchaseIntent.js";

import {
  verifyReviveCreditPurchaseReceipt,
} from "../reviveCreditPurchaseReceipt.js";

const USER = "0912345678";

const ID_A =
  "11111111-1111-4111-8111-111111111111";

const ID_B =
  "22222222-2222-4222-8222-222222222222";

function storage() {
  const values = new Map();

  return {
    getItem: key =>
      values.has(key)
        ? values.get(key)
        : null,

    setItem: (key, value) => {
      values.set(key, value);
    },

    removeItem: key => {
      values.delete(key);
    },
  };
}

function args(store, overrides = {}) {
  return {
    storage: store,
    userId: USER,
    fundingSource: "wallet",
    requiredQuantity: 2,
    price: {
      enabled: true,
      price_vnd: "3000",
      points_cost: "3",
    },
    createRequestId: () => ID_A,
    ...overrides,
  };
}

function backendReceipt(intent, unit = "3000", applied = true) {
  const data = {
    applied,
    request_id: intent.request_id,
    quantity: intent.quantity,
    unit_price: unit,
    total_cost:
      (
        BigInt(unit) *
        BigInt(intent.quantity)
      ).toString(),
    wallet_transaction_id: ID_A,
    credit_transaction_id: "123",
    wallet_balance_after: "9000",
    credit_balance_after: 7,
  };

  return verifyReviveCreditPurchaseReceipt({
    fundingSource: "wallet",
    requestId: intent.request_id,
    quantity: intent.quantity,
    data,
  });
}

test("intent exists before financial transport", async () => {
  const store = storage();

  await executeReviveCreditPurchase(
    args(store, {
      purchase: async ({ intent }) => {
        const saved =
          readReviveCreditPurchaseIntent({
            storage: store,
            userId: USER,
          });

        assert.equal(
          saved.request_id,
          intent.request_id
        );

        return backendReceipt(intent);
      },
    })
  );

  assert.equal(
    readReviveCreditPurchaseIntent({
      storage: store,
      userId: USER,
    }),
    null
  );
});

test("committed payment plus lost response retains original intent", async () => {
  const store = storage();
  let committed = null;

  await assert.rejects(
    executeReviveCreditPurchase(
      args(store, {
        purchase: async ({ intent }) => {
          committed = backendReceipt(intent);

          throw new Error(
            "NETWORK_RESPONSE_LOST"
          );
        },
      })
    ),
    /NETWORK_RESPONSE_LOST/
  );

  assert.equal(
    committed.request_id,
    ID_A
  );

  const persisted =
    readReviveCreditPurchaseIntent({
      storage: store,
      userId: USER,
    });

  assert.equal(
    persisted.request_id,
    ID_A
  );

  assert.equal(
    persisted.quantity,
    2
  );

  assert.equal(
    persisted.funding_source,
    "wallet"
  );
});

test("changed Admin price replays original purchase and historical receipt", async () => {
  const store = storage();

  let commits = 0;
  let firstReceipt = null;

  const transport =
    async ({ intent }) => {
      if (!firstReceipt) {
        commits++;

        firstReceipt =
          backendReceipt(
            intent,
            "3000",
            true
          );

        throw new Error(
          "RESPONSE_LOST"
        );
      }

      assert.equal(
        intent.request_id,
        ID_A
      );

      return {
        ...firstReceipt,
        applied: false,
      };
    };

  await assert.rejects(
    executeReviveCreditPurchase(
      args(store, {
        purchase: transport,
      })
    ),
    /RESPONSE_LOST/
  );

  const receipt =
    await executeReviveCreditPurchase(
      args(store, {
        fundingSource: "wallet",
        requiredQuantity: 5,
        price: {
          enabled: true,
          price_vnd: "9000",
          points_cost: "9",
        },
        createRequestId: () => ID_B,
        purchase: transport,
      })
    );

  assert.equal(commits, 1);
  assert.equal(receipt.applied, false);
  assert.equal(receipt.request_id, ID_A);
  assert.equal(receipt.quantity, 2);
  assert.equal(receipt.unit_price_vnd, "3000");
  assert.equal(receipt.total_vnd, "6000");

  assert.equal(
    readReviveCreditPurchaseIntent({
      storage: store,
      userId: USER,
    }),
    null
  );
});

test("unresolved Wallet intent does not switch to Points", async () => {
  const store = storage();

  await assert.rejects(
    executeReviveCreditPurchase(
      args(store, {
        purchase: async () => {
          throw new Error("NETWORK");
        },
      })
    )
  );

  const receipt =
    await executeReviveCreditPurchase(
      args(store, {
        fundingSource: "points",
        requiredQuantity: 4,
        createRequestId: () => ID_B,
        purchase: async ({ intent }) => {
          assert.equal(
            intent.funding_source,
            "wallet"
          );

          assert.equal(
            intent.quantity,
            2
          );

          assert.equal(
            intent.request_id,
            ID_A
          );

          return backendReceipt(
            intent,
            "3000",
            false
          );
        },
      })
    );

  assert.equal(
    receipt.funding_source,
    "wallet"
  );
});

test("unconfigured Admin price rejects new purchase before transport", async () => {
  const store = storage();
  let called = false;

  await assert.rejects(
    executeReviveCreditPurchase(
      args(store, {
        price: {
          enabled: false,
          price_vnd: null,
          points_cost: null,
        },
        purchase: async () => {
          called = true;
        },
      })
    )
  );

  assert.equal(called, false);

  assert.equal(
    readReviveCreditPurchaseIntent({
      storage: store,
      userId: USER,
    }),
    null
  );
});

test("Points remain locked before HTTP", async () => {
  const store = storage();
  let called = false;

  await assert.rejects(
    executeReviveCreditPurchase(
      args(store, {
        fundingSource: "points",
        purchase: async () => {
          called = true;
        },
      })
    )
  );

  assert.equal(called, false);
});

test("wrong receipt request ID cannot clear intent", async () => {
  const store = storage();

  await assert.rejects(
    executeReviveCreditPurchase(
      args(store, {
        purchase: async ({ intent }) => ({
          ...backendReceipt(intent),
          request_id: ID_B,
        }),
      })
    ),
    /Biên nhận mua Credit/
  );

  assert.equal(
    readReviveCreditPurchaseIntent({
      storage: store,
      userId: USER,
    }).request_id,
    ID_A
  );
});

test("storage failure rejects before transport", async () => {
  const store = storage();
  let called = false;

  store.setItem = () => {
    throw new Error("STORAGE_DENIED");
  };

  await assert.rejects(
    executeReviveCreditPurchase(
      args(store, {
        purchase: async () => {
          called = true;
        },
      })
    )
  );

  assert.equal(called, false);
});

test("matching receipt clears intent for a new future purchase", async () => {
  const store = storage();

  await executeReviveCreditPurchase(
    args(store, {
      purchase: async ({ intent }) =>
        backendReceipt(intent),
    })
  );

  const second =
    await executeReviveCreditPurchase(
      args(store, {
        createRequestId: () => ID_B,
        purchase: async ({ intent }) =>
          backendReceipt(intent),
      })
    );

  assert.equal(
    second.request_id,
    ID_B
  );
});
