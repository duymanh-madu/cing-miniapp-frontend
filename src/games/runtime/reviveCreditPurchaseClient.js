import apiClient from
  "../../infra/api/apiClient.js";

import {
  getCanonicalAccessToken,
} from "../../infra/auth/persistedAuthSession.js";

import {
  recoverBackendAuthSession,
} from "../../infra/auth/authRecovery.js";

import {
  normalizeReviveCreditPrice,
  verifyReviveCreditPurchaseReceipt,
} from "./reviveCreditPurchaseReceipt.js";

function authConfig() {
  const token = String(
    getCanonicalAccessToken() || ""
  ).trim();

  if (!token) {
    throw new Error("Phiên đăng nhập không hợp lệ.");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

async function withAuth(operation) {
  try {
    return await operation(authConfig());
  } catch (error) {
    if (error?.response?.status !== 401) {
      throw error;
    }

    await recoverBackendAuthSession();

    // Only auth retry; original request_id is retained.
    return operation(authConfig());
  }
}

function unwrap(response) {
  const result = response?.data;

  if (
    result?.success !== true ||
    !result.data ||
    typeof result.data !== "object" ||
    Array.isArray(result.data)
  ) {
    throw new Error(
      "Phản hồi giao dịch chưa được xác minh."
    );
  }

  return result.data;
}

export async function getReviveCreditCustomerPrice() {
  const response = await withAuth(
    config =>
      apiClient.get(
        "/game/offline-revival/price",
        config
      )
  );

  return normalizeReviveCreditPrice(
    unwrap(response)
  );
}

export async function buyReviveCredits({ intent }) {
  if (
    !intent ||
    !["wallet", "points"].includes(
      intent.funding_source
    )
  ) {
    throw new Error(
      "Yêu cầu mua Credit không hợp lệ."
    );
  }

  const path =
    intent.funding_source === "wallet"
      ? "/wallet/buy-revive-credits"
      : "/game/economy-v2/revive-credits/points";

  const payload = {
    quantity: intent.quantity,
    request_id: intent.request_id,
  };

  const response = await withAuth(
    config =>
      apiClient.post(path, payload, config)
  );

  return verifyReviveCreditPurchaseReceipt({
    fundingSource: intent.funding_source,
    requestId: intent.request_id,
    quantity: intent.quantity,
    data: unwrap(response),
  });
}
