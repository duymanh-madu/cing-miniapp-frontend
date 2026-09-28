import {
  readReviveCreditPurchaseIntent,
  ensureReviveCreditPurchaseIntent,
  clearReviveCreditPurchaseIntent,
} from "./reviveCreditPurchaseIntent.js";

/*
 * Shared purchase orchestration.
 *
 * Financial authority remains backend-owned.
 * Purchase function must return a verified
 * receipt from reviveCreditPurchaseClient.
 *
 * A network failure never clears the intent
 * and never creates a replacement request_id.
 */
export async function executeReviveCreditPurchase({
  storage,
  userId,
  fundingSource,
  requiredQuantity,
  price,
  pointsEnabled = false,
  createRequestId,
  purchase,
  onIntent,
}) {
  if (
    typeof purchase !== "function" ||
    typeof createRequestId !== "function"
  ) {
    throw new Error(
      "Thiếu dịch vụ xác minh giao dịch."
    );
  }

  /*
   * This read is mandatory before considering
   * a new purchase or the latest Admin price.
   */
  const previous =
    readReviveCreditPurchaseIntent({
      storage,
      userId,
    });

  if (previous) {
    /*
     * Points must remain locked even when
     * an old Points intent exists locally.
     * Preserve it for a controlled recovery.
     */
    if (
      previous.funding_source === "points" &&
      !pointsEnabled
    ) {
      throw new Error(
        "Giao dịch điểm cũ cần được xác minh " +
        "sau khi hệ thống mở đồng bộ iPOS."
      );
    }
  } else {
    if (
      price?.enabled !== true ||
      !Number.isSafeInteger(requiredQuantity) ||
      requiredQuantity < 1 ||
      !["wallet", "points"].includes(
        fundingSource
      ) ||
      (
        fundingSource === "points" &&
        !pointsEnabled
      )
    ) {
      throw new Error(
        "Chưa thể tạo yêu cầu mua Credit."
      );
    }
  }

  /*
   * Existing intent wins over the current
   * selection, quantity and Admin price.
   */
  const intent =
    ensureReviveCreditPurchaseIntent({
      storage,
      userId,
      fundingSource:
        previous?.funding_source ||
        fundingSource,
      quantity:
        previous?.quantity ||
        requiredQuantity,
      createRequestId,
    });

  onIntent?.(intent);

  /*
   * The injected production operation is
   * buyReviveCredits(), which validates
   * backend financial receipts.
   */
  const receipt =
    await purchase({
      intent,
    });

  if (
    !receipt ||
    receipt.request_id !==
      intent.request_id ||
    receipt.funding_source !==
      intent.funding_source ||
    receipt.quantity !==
      intent.quantity ||
    !Number.isSafeInteger(
      receipt.credit_balance_after
    ) ||
    receipt.credit_balance_after < 0
  ) {
    throw new Error(
      "Biên nhận mua Credit chưa được xác minh."
    );
  }

  /*
   * Only an accepted matching receipt can
   * release the durable purchase fence.
   */
  clearReviveCreditPurchaseIntent({
    storage,
    userId,
    requestId: intent.request_id,
  });

  return receipt;
}
