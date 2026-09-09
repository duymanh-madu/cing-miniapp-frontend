import apiClient from "@/infra/api/apiClient";


function walletProjectionError(
  message
) {
  return new Error(
    `CING_WALLET_PROJECTION_INVALID: ${message}`
  );
}


export function safeWalletMoney(
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


function requireNonNegativeWalletMoney(
  value,
  field
) {
  const amount =
    Number(value);

  if (
    !Number.isSafeInteger(
      amount
    ) ||
    amount < 0
  ) {
    throw walletProjectionError(
      field
    );
  }

  return amount;
}


function requireWalletDelta(
  value
) {
  const amount =
    Number(value);

  if (
    !Number.isSafeInteger(
      amount
    ) ||
    amount === 0
  ) {
    throw walletProjectionError(
      "transaction.amount"
    );
  }

  return amount;
}


function optionalString(
  value
) {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  const normalized =
    String(value).trim();

  return normalized ||
    null;
}


export function resolveWalletBalance(
  data
) {
  if (
    !data?.account ||
    typeof data.account !==
      "object" ||
    Array.isArray(
      data.account
    )
  ) {
    throw walletProjectionError(
      "account"
    );
  }

  return requireNonNegativeWalletMoney(
    data.account.balance,
    "account.balance"
  );
}


export function projectWalletTransaction(
  row
) {
  if (
    !row ||
    typeof row !==
      "object" ||
    Array.isArray(row)
  ) {
    throw walletProjectionError(
      "transaction"
    );
  }

  const id =
    optionalString(
      row.id
    );

  const transactionType =
    optionalString(
      row.transaction_type
    );

  const createdAt =
    optionalString(
      row.created_at
    );

  if (
    !id ||
    !transactionType ||
    !createdAt ||
    Number.isNaN(
      Date.parse(createdAt)
    )
  ) {
    throw walletProjectionError(
      "transaction.identity"
    );
  }

  return {
    id,

    transaction_type:
      transactionType,

    amount:
      requireWalletDelta(
        row.amount
      ),

    balance_before:
      requireNonNegativeWalletMoney(
        row.balance_before,
        "transaction.balance_before"
      ),

    balance_after:
      requireNonNegativeWalletMoney(
        row.balance_after,
        "transaction.balance_after"
      ),

    reference_type:
      optionalString(
        row.reference_type
      ),

    reference_id:
      optionalString(
        row.reference_id
      ),

    reason:
      optionalString(
        row.reason
      ),

    note:
      optionalString(
        row.note
      ),

    created_at:
      createdAt,
  };
}


export function resolveWalletTransactions(
  data
) {
  if (
    !Array.isArray(
      data?.transactions
    )
  ) {
    throw walletProjectionError(
      "transactions"
    );
  }

  return data.transactions.map(
    projectWalletTransaction
  );
}


export async function fetchWalletOverview() {
  const response =
    await apiClient.get(
      "/wallet",
      {
        params: {
          limit: 20,
        },
      }
    );

  const data =
    response.data?.data;

  if (
    !data ||
    typeof data !==
      "object" ||
    Array.isArray(data)
  ) {
    throw walletProjectionError(
      "overview"
    );
  }

  return {
    raw:
      data,

    balance:
      resolveWalletBalance(
        data
      ),

    transactions:
      resolveWalletTransactions(
        data
      ),
  };
}
