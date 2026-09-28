import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  executeReviveCreditPurchase,
} from "../reviveCreditPurchaseFlow.js";

import {
  readReviveCreditPurchaseIntent,
} from "../reviveCreditPurchaseIntent.js";

const USER = "0912345678";

const REQUEST =
  "11111111-1111-4111-8111-111111111111";

const OTHER =
  "22222222-2222-4222-8222-222222222222";

const component = fs.readFileSync(
  new URL(
    "../../../features/game-center/components/" +
    "ReviveCreditPurchaseV2.jsx",
    import.meta.url
  ),
  "utf8"
);

const client = fs.readFileSync(
  new URL(
    "../reviveCreditPurchaseClient.js",
    import.meta.url
  ),
  "utf8"
);

function storage() {
  const values = new Map();

  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    removeItem: key => {
      values.delete(key);
    },
  };
}

function pointsArgs(store, overrides = {}) {
  return {
    storage: store,
    userId: USER,
    fundingSource: "points",
    requiredQuantity: 2,
    price: {
      enabled: true,
      price_vnd: "3000",
      points_cost: "3",
    },
    pointsEnabled: true,
    createRequestId: () => REQUEST,
    ...overrides,
  };
}

function receipt(intent, applied = true) {
  return {
    applied,
    funding_source: "points",
    request_id: intent.request_id,
    quantity: intent.quantity,
    unit_price_vnd: "3000",
    unit_price_points: "3",
    total_points: String(
      intent.quantity * 3
    ),
    credit_balance_after: 8,
    points_balance_after: 14,
  };
}

test(
  "Points UI is independently default-OFF gated",
  () => {
    assert.match(
      component,
      /VITE_CING_REVIVE_POINTS_PURCHASE_ENABLED/
    );

    assert.match(
      component,
      /===\s*"true"/
    );

    assert.match(
      component,
      /pointsEnabled:\s*POINTS_ENABLED/
    );

    assert.match(
      component,
      /POINTS_ENABLED\s*&&\s*pointsPriceReady/
    );
  }
);

test(
  "Wallet and Points reuse the canonical client",
  () => {
    assert.match(
      client,
      /\/wallet\/buy-revive-credits/
    );

    assert.match(
      client,
      /\/game\/economy-v2\/revive-credits\/points/
    );

    assert.match(
      client,
      /verifyReviveCreditPurchaseReceipt/
    );

    assert.match(
      component,
      /purchase:\s*buyReviveCredits/
    );
  }
);

test(
  "Points disabled rejects before purchase transport",
  async () => {
    const store = storage();

    let called = false;

    await assert.rejects(
      executeReviveCreditPurchase(
        pointsArgs(store, {
          pointsEnabled: false,
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
  }
);

test(
  "Points intent persists before transport",
  async () => {
    const store = storage();

    const result =
      await executeReviveCreditPurchase(
        pointsArgs(store, {
          purchase: async ({ intent }) => {
            const saved =
              readReviveCreditPurchaseIntent({
                storage: store,
                userId: USER,
              });

            assert.equal(
              saved.request_id,
              REQUEST
            );

            assert.equal(
              saved.funding_source,
              "points"
            );

            return receipt(intent);
          },
        })
      );

    assert.equal(
      result.funding_source,
      "points"
    );

    assert.equal(
      readReviveCreditPurchaseIntent({
        storage: store,
        userId: USER,
      }),
      null
    );
  }
);

test(
  "Lost Points response replays original intent",
  async () => {
    const store = storage();

    await assert.rejects(
      executeReviveCreditPurchase(
        pointsArgs(store, {
          purchase: async () => {
            throw new Error(
              "NETWORK_RESPONSE_LOST"
            );
          },
        })
      ),
      /NETWORK_RESPONSE_LOST/
    );

    const replay =
      await executeReviveCreditPurchase(
        pointsArgs(store, {
          fundingSource: "wallet",
          requiredQuantity: 10,
          price: {
            enabled: true,
            price_vnd: "9000",
            points_cost: "9",
          },
          createRequestId: () => OTHER,
          purchase: async ({ intent }) => {
            assert.equal(
              intent.request_id,
              REQUEST
            );

            assert.equal(
              intent.funding_source,
              "points"
            );

            assert.equal(
              intent.quantity,
              2
            );

            return receipt(intent, false);
          },
        })
      );

    assert.equal(
      replay.request_id,
      REQUEST
    );

    assert.equal(
      replay.funding_source,
      "points"
    );

    assert.equal(
      readReviveCreditPurchaseIntent({
        storage: store,
        userId: USER,
      }),
      null
    );
  }
);

test(
  "Disabled Points cannot replay old Points intent",
  async () => {
    const store = storage();

    await assert.rejects(
      executeReviveCreditPurchase(
        pointsArgs(store, {
          purchase: async () => {
            throw new Error("NETWORK");
          },
        })
      )
    );

    let called = false;

    await assert.rejects(
      executeReviveCreditPurchase(
        pointsArgs(store, {
          pointsEnabled: false,
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
      }).request_id,
      REQUEST
    );
  }
);

test(
  "Wrong Points receipt cannot release intent",
  async () => {
    const store = storage();

    await assert.rejects(
      executeReviveCreditPurchase(
        pointsArgs(store, {
          purchase: async ({ intent }) => ({
            ...receipt(intent),
            request_id: OTHER,
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
      REQUEST
    );
  }
);
