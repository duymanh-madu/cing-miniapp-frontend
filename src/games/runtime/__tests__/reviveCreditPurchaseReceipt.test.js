import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeReviveCreditPrice,
  verifyReviveCreditPurchaseReceipt,
} from "../reviveCreditPurchaseReceipt.js";

const ID =
  "11111111-1111-4111-8111-111111111111";

const wallet = {
  applied: true,
  request_id: ID,
  quantity: 2,
  unit_price: "3000",
  total_cost: "6000",
  wallet_transaction_id: ID,
  credit_transaction_id: "120",
  wallet_balance_after: "9000",
  credit_balance_after: 7,
};

const points = {
  applied: true,
  request_id: ID,
  quantity: 2,
  unit_price_vnd: "3000",
  unit_price_points: 3,
  total_points: 6,
  points_balance_after: 15,
  credit_transaction_id: "121",
  credit_balance_after: 7,
  ipos_sync_status: "pending",
};

function verify(source, data) {
  return verifyReviveCreditPurchaseReceipt({
    fundingSource: source,
    requestId: ID,
    quantity: 2,
    data,
  });
}

test("canonical price is exactly 1000 VND per point", () => {
  assert.deepEqual(
    normalizeReviveCreditPrice({
      enabled: true,
      price_vnd: "3000",
      points_cost: "3",
    }),
    {
      enabled: true,
      price_vnd: "3000",
      points_cost: "3",
    }
  );
});

test("NULL price disables purchase", () => {
  assert.equal(
    normalizeReviveCreditPrice({
      enabled: false,
      price_vnd: null,
      points_cost: null,
    }).enabled,
    false
  );
});

test("fractional point conversion is rejected", () => {
  assert.throws(() =>
    normalizeReviveCreditPrice({
      enabled: true,
      price_vnd: "1500",
      points_cost: "1",
    })
  );
});

test("Wallet purchase receipt verifies", () => {
  assert.equal(
    verify("wallet", wallet)
      .credit_balance_after,
    7
  );
});

test("Wallet replay uses historical receipt", () => {
  assert.equal(
    verify("wallet", {
      ...wallet,
      applied: false,
    }).applied,
    false
  );
});

test("Wallet wrong total fails closed", () => {
  assert.throws(() =>
    verify("wallet", {
      ...wallet,
      total_cost: "5000",
    })
  );
});

test("Wallet wrong request fails closed", () => {
  assert.throws(() =>
    verify("wallet", {
      ...wallet,
      request_id:
        "22222222-2222-4222-8222-222222222222",
    })
  );
});

test("Points pending iPOS receipt validates", () => {
  assert.equal(
    verify("points", points)
      .ipos_sync_status,
    "pending"
  );
});

test("Points replay receipt validates", () => {
  assert.equal(
    verify("points", {
      ...points,
      applied: false,
    }).applied,
    false
  );
});

test("Points conversion mismatch fails closed", () => {
  assert.throws(() =>
    verify("points", {
      ...points,
      unit_price_points: 2,
    })
  );
});

test("Points total mismatch fails closed", () => {
  assert.throws(() =>
    verify("points", {
      ...points,
      total_points: 5,
    })
  );
});

test("Points unknown iPOS status fails closed", () => {
  assert.throws(() =>
    verify("points", {
      ...points,
      ipos_sync_status: "unknown",
    })
  );
});

test("Wrong quantity fails closed", () => {
  assert.throws(() =>
    verify("wallet", {
      ...wallet,
      quantity: 3,
    })
  );
});
