import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeBranch,
  sameBranch,
  buildKdsUiSnapshot
} from "../cingKdsUiDataAdapterV1.js";

const BRANCH = {
  pos_parent: "CING",
  pos_id: 101
};

function response(data, branch = BRANCH) {
  return {
    success: true,
    branch,
    data
  };
}

function cup(id, status, group = "Trà sữa") {
  return {
    cup_id: id,
    order_id: "ORDER-1",
    tran_no: "HD001",
    item_name: "Trà sữa trân châu",
    item_group: group,
    status,
    elapsed_minutes: 5,
    severity: "normal"
  };
}

function build(overrides = {}) {
  return buildKdsUiSnapshot({
    branch: BRANCH,
    ordersResponse: response([
      cup("C1", "pending"),
      cup("C2", "preparing")
    ]),
    servingResponse: response([
      cup("C3", "prepared", "Trà trái cây")
    ]),
    ...overrides
  });
}

test("Branch identity normalizes POS ID", () => {
  assert.deepEqual(normalizeBranch(BRANCH), {
    pos_parent: "CING",
    pos_id: "101"
  });
});

test("Same POS across different parents is isolated", () => {
  assert.equal(sameBranch(
    BRANCH,
    { pos_parent: "OTHER", pos_id: 101 }
  ), false);
});

test("Preparation and serving stay separate", () => {
  const result = build();

  assert.equal(result.preparation.length, 2);
  assert.equal(result.serving.length, 1);
});

test("Cup identity and display fields are preserved", () => {
  const result = build();

  assert.equal(result.preparation[0].cup_id, "C1");
  assert.equal(result.preparation[0].tran_no, "HD001");
  assert.equal(result.preparation[0].item_name,
    "Trà sữa trân châu");
});

test("Group counts combine outstanding cups", () => {
  const result = build();

  assert.deepEqual(result.groupCounts, [
    { item_group: "Trà sữa", total_unserved: 2 },
    { item_group: "Trà trái cây", total_unserved: 1 }
  ]);
});

test("Different branch API response is rejected", () => {
  assert.throws(
    () => build({
      servingResponse: response(
        [],
        { pos_parent: "OTHER", pos_id: 101 }
      )
    }),
    /KDS_UI_RESPONSE_INVALID/
  );
});

test("Unsuccessful API response is rejected", () => {
  assert.throws(
    () => build({
      ordersResponse: {
        success: false,
        branch: BRANCH,
        data: []
      }
    }),
    /KDS_UI_RESPONSE_INVALID/
  );
});

test("Unexpected cup status is rejected", () => {
  assert.throws(
    () => build({
      ordersResponse: response([
        cup("C1", "served")
      ])
    }),
    /KDS_UI_CUP_INVALID/
  );
});

test("Duplicate cup across queues is rejected", () => {
  assert.throws(
    () => build({
      ordersResponse: response([
        cup("C1", "pending")
      ]),
      servingResponse: response([
        cup("C1", "prepared")
      ])
    }),
    /KDS_UI_DUPLICATE_CUP/
  );
});

test("Invalid elapsed time is rejected", () => {
  const invalid = cup("C1", "pending");
  invalid.elapsed_minutes = -2;

  assert.throws(
    () => build({
      ordersResponse: response([invalid])
    }),
    /KDS_UI_ELAPSED_INVALID/
  );
});

test("Missing version keeps mutation disabled", () => {
  const result = build();

  assert.equal(result.transitionsEnabled, false);
  assert.equal(result.preparation[0].version, null);
  assert.equal(
    result.preparation[0].transition_ready,
    false
  );
});

test("Version alone never authorizes mutation", () => {
  const withVersion = cup("C1", "pending");
  withVersion.version = 2;

  const result = build({
    ordersResponse: response([withVersion])
  });

  assert.equal(result.preparation[0].version, 2);
  assert.equal(
    result.preparation[0].transition_ready,
    false
  );
});

test("Unrequested reports default to empty", () => {
  const result = build();

  assert.deepEqual(result.alerts, []);
  assert.deepEqual(result.performance, []);
});

test("Invalid branch identity is rejected", () => {
  assert.throws(
    () => normalizeBranch({
      pos_parent: "CING",
      pos_id: "*"
    }),
    /KDS_UI_BRANCH_INVALID/
  );
});
