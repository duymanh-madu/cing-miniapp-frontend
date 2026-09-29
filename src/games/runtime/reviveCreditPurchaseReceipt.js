/*
 * Cing Game Center V2:
 * validate server-owned price and purchase receipts.
 * Historical replay prices need not equal current quote.
 */

const MAX_INT = 2147483647n;
const MAX_BIGINT = 9223372036854775807n;

function invalid() {
  throw new Error(
    "Chưa xác minh được giao dịch Thẻ hồi sinh."
  );
}

function integer(value, minimum = 0n, maximum = MAX_BIGINT) {
  if (
    typeof value !== "string" &&
    typeof value !== "number"
  ) invalid();

  if (
    typeof value === "number" &&
    !Number.isSafeInteger(value)
  ) invalid();

  const text = String(value);

  if (!/^(0|[1-9][0-9]*)$/.test(text)) invalid();

  const number = BigInt(text);

  if (
    number < minimum ||
    number > maximum
  ) invalid();

  return number;
}

export function normalizeReviveCreditPrice(data) {
  if (
    !data ||
    typeof data.enabled !== "boolean"
  ) invalid();

  if (!data.enabled) {
    if (
      data.price_vnd !== null ||
      data.points_cost !== null
    ) invalid();

    return {
      enabled: false,
      price_vnd: null,
      points_cost: null,
    };
  }

  const vnd = integer(data.price_vnd, 1000n);
  const points = integer(
    data.points_cost,
    1n,
    MAX_INT
  );

  if (
    vnd % 1000n !== 0n ||
    vnd / 1000n !== points
  ) invalid();

  return {
    enabled: true,
    price_vnd: vnd.toString(),
    points_cost: points.toString(),
  };
}

export function verifyReviveCreditPurchaseReceipt({
  fundingSource,
  requestId,
  quantity,
  data,
}) {
  if (
    !data ||
    Array.isArray(data) ||
    typeof data !== "object" ||
    typeof data.applied !== "boolean" ||
    data.request_id !== requestId ||
    data.quantity !== quantity ||
    !Number.isSafeInteger(quantity) ||
    quantity < 1
  ) invalid();

  if (fundingSource === "wallet") {
    const unit = integer(data.unit_price, 1000n);
    const total = integer(data.total_cost, 1000n);
    const credits = integer(
      data.credit_balance_after,
      0n,
      MAX_INT
    );

    integer(data.wallet_balance_after);

    if (
      unit % 1000n !== 0n ||
      unit * BigInt(quantity) !== total ||
      typeof data.wallet_transaction_id !== "string" ||
      !data.wallet_transaction_id ||
      data.credit_transaction_id == null
    ) invalid();

    const creditTransaction = integer(
      data.credit_transaction_id,
      1n
    );

    return {
      applied: data.applied,
      request_id: requestId,
      funding_source: "wallet",
      quantity,
      unit_price_vnd: unit.toString(),
      total_vnd: total.toString(),
      wallet_transaction_id:
        data.wallet_transaction_id,
      credit_transaction_id:
        creditTransaction.toString(),
      credit_balance_after: Number(credits),
    };
  }

  if (fundingSource === "points") {
    const vnd = integer(data.unit_price_vnd, 1000n);
    const points = integer(
      data.unit_price_points,
      1n,
      MAX_INT
    );
    const total = integer(
      data.total_points,
      1n,
      MAX_INT
    );
    const credits = integer(
      data.credit_balance_after,
      0n,
      MAX_INT
    );

    integer(
      data.points_balance_after,
      0n,
      MAX_INT
    );

    const transaction = integer(
      data.credit_transaction_id,
      1n
    );

    if (
      vnd % 1000n !== 0n ||
      vnd / 1000n !== points ||
      points * BigInt(quantity) !== total ||
      ![
        "pending",
        "processing",
        "synced",
        "failed",
      ].includes(data.ipos_sync_status)
    ) invalid();

    return {
      applied: data.applied,
      request_id: requestId,
      funding_source: "points",
      quantity,
      unit_price_vnd: vnd.toString(),
      total_points: total.toString(),
      credit_transaction_id:
        transaction.toString(),
      credit_balance_after: Number(credits),
      ipos_sync_status: data.ipos_sync_status,
    };
  }

  invalid();
}
