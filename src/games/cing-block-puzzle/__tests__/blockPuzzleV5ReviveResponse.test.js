import assert from
  "node:assert/strict";

import {
  test,
} from "node:test";

import {
  normalizeBlockPuzzleV5ReviveResponse,
  V5_CREDIT_COSTS,
} from "../runtime/blockPuzzleV5ReviveResponse.js";

const SESSION =
  "11111111-1111-4111-8111-111111111111";

const PURCHASE =
  "22222222-2222-4222-8222-222222222222";

function receipt(
  overrides = {}
) {
  return {
    purchase_id:
      PURCHASE,

    session_id:
      SESSION,

    continue_index:
      1,

    credit_cost:
      1,

    credit_transaction_id:
      "123",

    balance_before:
      31,

    balance_after:
      30,

    continue_count:
      1,

    verified_replay_fingerprint:
      "a".repeat(64),

    created_at:
      "2026-09-25T00:00:00.000Z",

    idempotent:
      false,

    ...overrides,
  };
}

function normalize(raw) {
  return normalizeBlockPuzzleV5ReviveResponse(
    raw,
    SESSION
  );
}

test(
  "exact V5 credit progression",
  () => {
    assert.deepEqual(
      [...V5_CREDIT_COSTS],
      [0, 1, 2, 4, 8, 16]
    );
  }
);

test(
  "five valid receipt tiers",
  () => {
    for (
      let index = 1;
      index <= 5;
      index += 1
    ) {
      const cost =
        V5_CREDIT_COSTS[index];

      const result =
        normalize(
          receipt({
            continue_index:
              index,

            credit_cost:
              cost,

            balance_after:
              31 - cost,

            continue_count:
              index,
          })
        );

      assert.equal(
        result.credit_cost,
        cost
      );
    }
  }
);

test(
  "receipt is immutable",
  () => {
    assert.equal(
      Object.isFrozen(
        normalize(receipt())
      ),
      true
    );
  }
);

test(
  "legacy points receipt rejected",
  () => {
    assert.throws(
      () => normalize({
        ...receipt(),
        points_cost: 5,
      }),
      /points_cost/
    );
  }
);

test(
  "missing credit cost rejected",
  () => {
    assert.throws(
      () => normalize(
        receipt({
          credit_cost:
            undefined,
        })
      ),
      /credit_cost/
    );
  }
);

test(
  "sixth Continue rejected",
  () => {
    assert.throws(
      () => normalize(
        receipt({
          continue_index:
            6,
        })
      ),
      /financial invariant/
    );
  }
);

test(
  "incorrect price rejected",
  () => {
    assert.throws(
      () => normalize(
        receipt({
          credit_cost:
            5,
        })
      ),
      /financial invariant/
    );
  }
);

test(
  "incorrect balance subtraction rejected",
  () => {
    assert.throws(
      () => normalize(
        receipt({
          balance_after:
            29,
        })
      ),
      /financial invariant/
    );
  }
);

test(
  "incorrect continue count rejected",
  () => {
    assert.throws(
      () => normalize(
        receipt({
          continue_count:
            2,
        })
      ),
      /financial invariant/
    );
  }
);

test(
  "different session rejected",
  () => {
    assert.throws(
      () => normalize(
        receipt({
          session_id:
            "33333333-3333-4333-8333-333333333333",
        })
      ),
      /session mismatch/
    );
  }
);

test(
  "invalid SHA256 rejected",
  () => {
    assert.throws(
      () => normalize(
        receipt({
          verified_replay_fingerprint:
            "wrong",
        })
      ),
      /fingerprint/
    );
  }
);

test(
  "bigint ledger identity retained as string",
  () => {
    const id =
      "9223372036854775807";

    assert.equal(
      normalize(
        receipt({
          credit_transaction_id:
            id,
        })
      ).credit_transaction_id,
      id
    );
  }
);

test(
  "unsafe numeric ledger identity rejected",
  () => {
    assert.throws(
      () => normalize(
        receipt({
          credit_transaction_id:
            Number.MAX_SAFE_INTEGER + 1,
        })
      ),
      /độ chính xác/
    );
  }
);

test(
  "historical idempotent receipt accepted",
  () => {
    assert.equal(
      normalize(
        receipt({
          idempotent:
            true,
        })
      ).idempotent,
      true
    );
  }
);

test(
  "nonboolean idempotency rejected",
  () => {
    assert.throws(
      () => normalize(
        receipt({
          idempotent:
            "true",
        })
      ),
      /idempotency/
    );
  }
);

test(
  "null balance cannot become zero",
  () => {
    assert.throws(
      () => normalize(
        receipt({
          balance_after:
            null,
        })
      ),
      /balance_after/
    );
  }
);
