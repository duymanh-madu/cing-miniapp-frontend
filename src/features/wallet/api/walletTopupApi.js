import apiClient from "@/infra/api/apiClient";

export async function fetchWalletPromotion() {
  const response =
    await apiClient.get(
      "/wallet/topup/promotion"
    );

  return (
    response.data?.data ||
    null
  );
}

export async function createWalletTopupSession(
  amount
) {
  const response =
    await apiClient.post(
      "/wallet/topup/session",
      {
        amount,
      }
    );

  return response.data;
}

export async function reconcileWalletTopup(
  transactionCode
) {
  const response =
    await apiClient.post(
      `/payments/reconcile/${encodeURIComponent(
        transactionCode
      )}`
    );

  return (
    response.data?.data ||
    {}
  );
}
