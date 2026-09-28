import test from "node:test";
import assert from "node:assert/strict";

import {
  ensureReviveCreditPurchaseIntent,
  readReviveCreditPurchaseIntent,
  clearReviveCreditPurchaseIntent,
  REVIVE_CREDIT_PURCHASE_INTENT_KEY,
} from "../reviveCreditPurchaseIntent.js";

const OWNER = "0912345678";

const REQUEST_A =
  "11111111-1111-4111-8111-111111111111";

const REQUEST_B =
  "22222222-2222-4222-8222-222222222222";

function memoryStorage() {
  const data = new Map();

  return {
    getItem: key =>
      data.has(key)
        ? data.get(key)
        : null,

    setItem: (key, value) =>
      data.set(key, value),

    removeItem: key =>
      data.delete(key),
  };
}

function create(storage, overrides = {}) {
  return ensureReviveCreditPurchaseIntent({
    storage,
    userId: OWNER,
    fundingSource: "wallet",
    quantity: 2,
    createRequestId: () => REQUEST_A,
    ...overrides,
  });
}

test("intent persists before caller can POST", () => {
  const storage = memoryStorage();
  const intent = create(storage);

  assert.equal(
    JSON.parse(
      storage.getItem(
        REVIVE_CREDIT_PURCHASE_INTENT_KEY
      )
    ).request_id,
    intent.request_id
  );
});

test("same purchase reuses original request ID", () => {
  const storage = memoryStorage();

  create(storage);

  const replay = create(storage, {
    createRequestId: () => REQUEST_B,
  });

  assert.equal(
    replay.request_id,
    REQUEST_A
  );
});

test("reload retains unresolved purchase", () => {
  const storage = memoryStorage();

  create(storage);

  const restored =
    readReviveCreditPurchaseIntent({
      storage,
      userId: OWNER,
    });

  assert.equal(
    restored.quantity,
    2
  );

  assert.equal(
    restored.funding_source,
    "wallet"
  );
});

test("cannot switch Wallet to Points during ambiguity", () => {
  const storage = memoryStorage();

  create(storage);

  assert.throws(
    () => create(storage, {
      fundingSource: "points",
    }),
    {
      code:
        "REVIVE_CREDIT_PURCHASE_UNRESOLVED",
    }
  );
});

test("cannot change quantity during ambiguity", () => {
  const storage = memoryStorage();

  create(storage);

  assert.throws(
    () => create(storage, {
      quantity: 3,
    }),
    {
      code:
        "REVIVE_CREDIT_PURCHASE_UNRESOLVED",
    }
  );
});

test("another member cannot inherit pending payment", () => {
  const storage = memoryStorage();

  create(storage);

  assert.throws(
    () => readReviveCreditPurchaseIntent({
      storage,
      userId: "0987654321",
    }),
    {
      code:
        "REVIVE_CREDIT_PURCHASE_OTHER_MEMBER",
    }
  );
});

test("clear requires original request ID", () => {
  const storage = memoryStorage();

  create(storage);

  assert.throws(
    () => clearReviveCreditPurchaseIntent({
      storage,
      userId: OWNER,
      requestId: REQUEST_B,
    }),
    {
      code:
        "REVIVE_CREDIT_PURCHASE_CLEAR_MISMATCH",
    }
  );

  assert.ok(
    readReviveCreditPurchaseIntent({
      storage,
      userId: OWNER,
    })
  );
});

test("verified clear removes only matching intent", () => {
  const storage = memoryStorage();

  create(storage);

  assert.equal(
    clearReviveCreditPurchaseIntent({
      storage,
      userId: OWNER,
      requestId: REQUEST_A,
    }),
    true
  );

  assert.equal(
    readReviveCreditPurchaseIntent({
      storage,
      userId: OWNER,
    }),
    null
  );
});

test("corrupted intent fails closed", () => {
  const storage = memoryStorage();

  storage.setItem(
    REVIVE_CREDIT_PURCHASE_INTENT_KEY,
    "{broken"
  );

  assert.throws(
    () => create(storage),
    {
      code:
        "REVIVE_CREDIT_PURCHASE_INTENT_CORRUPTED",
    }
  );
});

test("storage failure rejects before HTTP", () => {
  const storage = memoryStorage();

  storage.setItem = () => {
    throw new Error("quota");
  };

  assert.throws(
    () => create(storage),
    {
      code:
        "REVIVE_CREDIT_PURCHASE_STORAGE_UNAVAILABLE",
    }
  );
});

test("invalid quantity never creates intent", () => {
  const storage = memoryStorage();

  assert.throws(
    () => create(storage, {
      quantity: 0,
    }),
    {
      code:
        "REVIVE_CREDIT_PURCHASE_QUANTITY_INVALID",
    }
  );

  assert.equal(
    storage.getItem(
      REVIVE_CREDIT_PURCHASE_INTENT_KEY
    ),
    null
  );
});

test("invalid UUID never creates intent", () => {
  const storage = memoryStorage();

  assert.throws(
    () => create(storage, {
      createRequestId:
        () => "not-a-uuid",
    }),
    {
      code:
        "REVIVE_CREDIT_PURCHASE_REQUEST_INVALID",
    }
  );

  assert.equal(
    storage.getItem(
      REVIVE_CREDIT_PURCHASE_INTENT_KEY
    ),
    null
  );
});

test("successful same-source new purchase gets new ID after clear", () => {
  const storage = memoryStorage();

  create(storage);

  clearReviveCreditPurchaseIntent({
    storage,
    userId: OWNER,
    requestId: REQUEST_A,
  });

  const next = create(storage, {
    createRequestId: () => REQUEST_B,
  });

  assert.equal(
    next.request_id,
    REQUEST_B
  );
});
