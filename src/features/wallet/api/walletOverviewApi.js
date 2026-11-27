import apiClient from "@/infra/api/apiClient";
import { recoverBackendAuthSession } from "@/infra/auth/authRecovery";
import { authSessionEpochV42, requireAuthSessionEpochV42 } from "@/infra/auth/authSessionEpochV42";
import { currentCustomerIdentityV42 } from "@/infra/auth/currentCustomerIdentityV42";
import useAuthStore from "@/stores/auth/authStore";


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

    pos_payment:
      row.pos_payment &&
      typeof row.pos_payment ===
        "object" &&
      !Array.isArray(
        row.pos_payment
      )
        ? {
            store_display_name:
              optionalString(
                row.pos_payment
                  .store_display_name
              ),
          }
        : null,

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
  const auth = useAuthStore.getState();
  const owner = currentCustomerIdentityV42(auth);
  if (!owner.ready) throw walletProjectionError("session");

  async function read(token) {
    const epoch = authSessionEpochV42();
    const response = await apiClient.get("/wallet", {
      params: { limit: 20 },
      headers: { Authorization: `Bearer ${token}` },
    });
    requireAuthSessionEpochV42(epoch);
    return response;
  }

  const initialEpoch = authSessionEpochV42();
  let response;
  try {
    response = await read(auth.accessToken);
  } catch (error) {
    if (error?.response?.status !== 401) throw error;
    requireAuthSessionEpochV42(initialEpoch);
    const refreshed = await recoverBackendAuthSession();
    const current = useAuthStore.getState();
    const currentOwner = currentCustomerIdentityV42(current);
    if (!currentOwner.ready || currentOwner.id !== owner.id ||
        currentOwner.phone !== owner.phone || current.accessToken !== refreshed.accessToken) {
      throw walletProjectionError("session");
    }
    response = await read(refreshed.accessToken);
  }

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
