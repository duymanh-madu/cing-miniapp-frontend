const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SHA256 =
  /^[0-9a-f]{64}$/;

const V5_CREDIT_COSTS =
  Object.freeze([
    0,
    1,
    2,
    4,
    8,
    16,
  ]);

function fail(message) {
  const error =
    new Error(message);

  error.code =
    "BLOCK_PUZZLE_V5_REVIVE_RESPONSE_INVALID";

  throw error;
}

function requireInteger(
  value,
  label,
  min = 0
) {
  if (
    (
      typeof value !== "number" &&
      (
        typeof value !== "string" ||
        !/^(0|[1-9][0-9]*)$/.test(value)
      )
    ) ||
    value === null
  ) {
    fail(`${label} không hợp lệ`);
  }

  const number =
    Number(value);

  if (
    !Number.isSafeInteger(number) ||
    number < min
  ) {
    fail(`${label} không hợp lệ`);
  }

  return number;
}

export function
normalizeBlockPuzzleV5ReviveResponse(
  raw,
  expectedSessionId
) {
  if (
    !raw ||
    typeof raw !== "object" ||
    Array.isArray(raw)
  ) {
    fail("V5 receipt không hợp lệ");
  }

  /*
   * V5 credit and legacy loyalty points
   * must never share one financial contract.
   */

  if (
    Object.prototype.hasOwnProperty.call(
      raw,
      "points_cost"
    )
  ) {
    fail(
      "V5 receipt không được chứa points_cost"
    );
  }

  const sessionId =
    String(raw.session_id || "");

  const purchaseId =
    String(raw.purchase_id || "");

  if (
    !UUID_V4.test(sessionId) ||
    !UUID_V4.test(purchaseId) ||
    sessionId !== expectedSessionId
  ) {
    fail("V5 receipt session mismatch");
  }

  const continueIndex =
    requireInteger(
      raw.continue_index,
      "continue_index",
      1
    );

  const creditCost =
    requireInteger(
      raw.credit_cost,
      "credit_cost",
      1
    );

  const balanceBefore =
    requireInteger(
      raw.balance_before,
      "balance_before"
    );

  const balanceAfter =
    requireInteger(
      raw.balance_after,
      "balance_after"
    );

  const continueCount =
    requireInteger(
      raw.continue_count,
      "continue_count",
      1
    );

  if (
    continueIndex > 5 ||
    creditCost !==
      V5_CREDIT_COSTS[continueIndex] ||
    continueCount !== continueIndex ||
    balanceAfter !==
      balanceBefore - creditCost
  ) {
    fail(
      "V5 credit financial invariant không khớp"
    );
  }

  const rawTransactionId =
    raw.credit_transaction_id;

  if (
    typeof rawTransactionId === "number" &&
    !Number.isSafeInteger(
      rawTransactionId
    )
  ) {
    fail(
      "V5 ledger ID mất độ chính xác"
    );
  }

  const creditTransactionId =
    String(
      rawTransactionId ?? ""
    );

  if (
    !/^[1-9][0-9]*$/.test(
      creditTransactionId
    ) ||
    BigInt(creditTransactionId) >
      9223372036854775807n
  ) {
    fail("V5 ledger ID không hợp lệ");
  }

  const fingerprint =
    String(
      raw.verified_replay_fingerprint ||
      ""
    );

  if (!SHA256.test(fingerprint)) {
    fail(
      "V5 verified fingerprint không hợp lệ"
    );
  }

  if (
    typeof raw.idempotent !==
      "boolean"
  ) {
    fail(
      "V5 idempotency flag không hợp lệ"
    );
  }

  const createdAt =
    String(
      raw.created_at || ""
    );

  if (
    !Number.isFinite(
      Date.parse(createdAt)
    )
  ) {
    fail(
      "V5 receipt timestamp không hợp lệ"
    );
  }

  return Object.freeze({
    purchase_id:
      purchaseId,

    session_id:
      sessionId,

    continue_index:
      continueIndex,

    credit_cost:
      creditCost,

    credit_transaction_id:
      creditTransactionId,

    balance_before:
      balanceBefore,

    balance_after:
      balanceAfter,

    continue_count:
      continueCount,

    verified_replay_fingerprint:
      fingerprint,

    created_at:
      createdAt,

    idempotent:
      raw.idempotent,
  });
}

export {
  V5_CREDIT_COSTS,
};
