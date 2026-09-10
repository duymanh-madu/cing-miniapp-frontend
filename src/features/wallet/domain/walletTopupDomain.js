export const WALLET_TOPUP_PENDING_KEY =
  "cing_wallet_pending_topup_v1";


const WALLET_TOPUP_TRANSACTION_TYPE =
  "topup";

const WALLET_PAYMENT_REFERENCE_TYPE =
  "payment_transaction";


export function safeTopupMoney(
  value
) {
  const amount =
    Number(value);

  return (
    Number.isSafeInteger(
      amount
    ) &&
    amount >= 0
  )
    ? amount
    : 0;
}


function positiveMoney(
  value
) {
  const amount =
    Number(value);

  return (
    Number.isSafeInteger(
      amount
    ) &&
    amount > 0
  )
    ? amount
    : null;
}


export function normalizeTopupAmountInput(
  value
) {
  return String(
    value ?? ""
  ).replace(
    /\D/g,
    ""
  );
}


export function normalizePaymentTransactionId(
  value
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const normalized =
    String(value).trim();

  return /^[1-9][0-9]*$/.test(
    normalized
  )
    ? normalized
    : null;
}


export function readPendingWalletTopup() {
  try {
    const raw =
      sessionStorage.getItem(
        WALLET_TOPUP_PENDING_KEY
      );

    if (!raw) {
      return null;
    }

    const value =
      JSON.parse(raw);

    const amount =
      positiveMoney(
        value?.amount
      );

    const transactionCode =
      typeof value?.transactionCode ===
        "string"
        ? value.transactionCode.trim()
        : "";

    if (
      amount === null ||
      !transactionCode
    ) {
      return null;
    }

    return {
      amount,

      transactionCode,

      paymentTransactionId:
        normalizePaymentTransactionId(
          value?.paymentTransactionId
        ),

      expiredAt:
        value?.expiredAt ??
        null,

      createdAt:
        Number.isFinite(
          Number(
            value?.createdAt
          )
        )
          ? Number(
              value.createdAt
            )
          : null,
    };
  } catch {
    return null;
  }
}


export function writePendingWalletTopup(
  value
) {
  try {
    sessionStorage.setItem(
      WALLET_TOPUP_PENDING_KEY,
      JSON.stringify(
        value
      )
    );
  } catch {
    /*
     * Browser storage is recovery support only.
     * It is never Wallet financial authority.
     */
  }
}


export function clearPendingWalletTopup() {
  try {
    sessionStorage.removeItem(
      WALLET_TOPUP_PENDING_KEY
    );
  } catch {
    /*
     * Browser storage is presentation-only.
     */
  }
}


export function normalizeWalletPromotion(
  data
) {
  if (
    !data ||
    data.active !== true
  ) {
    return null;
  }

  if (
    !Array.isArray(
      data.tiers
    )
  ) {
    return null;
  }

  const tiers =
    data.tiers
      .map(
        tier => {
          const minTopupAmount =
            positiveMoney(
              tier?.min_topup_amount
            );

          const bonusAmount =
            positiveMoney(
              tier?.bonus_amount
            );

          if (
            minTopupAmount === null ||
            bonusAmount === null
          ) {
            return null;
          }

          const receiveAmount =
            minTopupAmount +
            bonusAmount;

          if (
            !Number.isSafeInteger(
              receiveAmount
            ) ||
            receiveAmount <=
              minTopupAmount
          ) {
            return null;
          }

          return {
            minTopupAmount,
            bonusAmount,
            receiveAmount,
            isFeatured:
              tier?.is_featured ===
              true,
          };
        }
      )
      .filter(Boolean)
      .sort(
        (
          left,
          right
        ) =>
          left.minTopupAmount -
          right.minTopupAmount
      );

  return {
    active: true,

    name:
      typeof data.name ===
        "string" &&
      data.name.trim()
        ? data.name.trim()
        : null,

    startsAt:
      data.starts_at ??
      null,

    endsAt:
      data.ends_at ??
      null,

    tiers,
  };
}


export function transactionMatchesPendingTopup(
  transaction,
  pending
) {
  if (
    !transaction ||
    !pending
  ) {
    return false;
  }

  const paymentTransactionId =
    normalizePaymentTransactionId(
      pending.paymentTransactionId
    );

  if (!paymentTransactionId) {
    return false;
  }

  const amount =
    positiveMoney(
      pending.amount
    );

  if (amount === null) {
    return false;
  }

  return (
    transaction.transaction_type ===
      WALLET_TOPUP_TRANSACTION_TYPE &&
    transaction.reference_type ===
      WALLET_PAYMENT_REFERENCE_TYPE &&
    String(
      transaction.reference_id ??
      ""
    ).trim() ===
      paymentTransactionId &&
    Number(
      transaction.amount
    ) === amount
  );
}


export function walletSnapshotConfirmsTopup(
  snapshot,
  pending
) {
  if (
    !pending?.paymentTransactionId
  ) {
    return false;
  }

  const transactions =
    Array.isArray(
      snapshot?.transactions
    )
      ? snapshot.transactions
      : [];

  return transactions.some(
    transaction =>
      transactionMatchesPendingTopup(
        transaction,
        pending
      )
  );
}


export function reconciliationIsTerminalFailure(
  reconciliation
) {
  return (
    reconciliation?.payment_status ===
      "failed" ||
    reconciliation
      ?.reconciliation
      ?.status ===
      "terminal_failed"
  );
}


export function extractReconciliationPaymentIdentity(
  reconciliation
) {
  return normalizePaymentTransactionId(
    reconciliation
      ?.reconciliation
      ?.payment_transaction_id
  );
}


export function validateWalletTopupSession(
  responsePayload,
  requestedAmount
) {
  const amount =
    positiveMoney(
      requestedAmount
    );

  if (amount === null) {
    throw new Error(
      "Số tiền nạp không hợp lệ."
    );
  }

  const data =
    responsePayload?.data;

  const paymentSession =
    data?.payment;

  const paymentRecord =
    paymentSession?.payment;

  if (
    responsePayload?.success !==
      true ||
    paymentSession?.success !==
      true ||
    !paymentRecord
  ) {
    throw new Error(
      responsePayload?.message ||
      "Không thể tạo phiên nạp Cing Wallet."
    );
  }

  if (
    Number(
      data?.amount
    ) !== amount
  ) {
    throw new Error(
      "Số tiền phiên thanh toán không khớp."
    );
  }

  if (
    Number(
      paymentRecord.amount
    ) !== amount
  ) {
    throw new Error(
      "Số tiền giao dịch thanh toán không khớp."
    );
  }

  if (
    paymentRecord.payment_purpose !==
      "wallet_topup"
  ) {
    throw new Error(
      "Sai mục đích giao dịch Cing Wallet."
    );
  }

  if (
    paymentRecord.payment_provider !==
      "zalo_checkout" ||
    paymentRecord.payment_method !==
      "zalo_checkout"
  ) {
    throw new Error(
      "Sai phương thức thanh toán Cing Wallet."
    );
  }

  const transactionCode =
    typeof paymentRecord.transaction_code ===
      "string"
      ? paymentRecord.transaction_code.trim()
      : "";

  if (!transactionCode) {
    throw new Error(
      "Không nhận được mã giao dịch Cing Wallet."
    );
  }

  const zaloOrder =
    paymentSession.zaloOrder;

  if (
    !zaloOrder ||
    typeof zaloOrder !==
      "object" ||
    Number(
      zaloOrder.amount
    ) !== amount ||
    typeof zaloOrder.orderId !==
      "string" ||
    zaloOrder.orderId.trim() !==
      transactionCode ||
    !Array.isArray(
      zaloOrder.item
    ) ||
    zaloOrder.item.length ===
      0 ||
    typeof zaloOrder.desc !==
      "string" ||
    !zaloOrder.desc.trim() ||
    typeof zaloOrder.mac !==
      "string" ||
    !zaloOrder.mac.trim() ||
    typeof zaloOrder.extradata !==
      "string" ||
    typeof zaloOrder.method !==
      "string" ||
    !zaloOrder.method.trim()
  ) {
    throw new Error(
      "Dữ liệu Zalo Checkout không hợp lệ."
    );
  }

  return {
    zaloOrder,

    pending: {
      amount,

      transactionCode,

      /*
       * Canonical DB payment identity is learned from the
       * authenticated reconciliation authority.
       *
       * Do not infer it from provider payloads.
       */
      paymentTransactionId:
        null,

      expiredAt:
        paymentSession.expired_at ||
        null,

      createdAt:
        Date.now(),
    },
  };
}
