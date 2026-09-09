import apiClient from "@/infra/api/apiClient";


function normalizeCapability(
  value
) {
  const capability =
    String(
      value || ""
    ).trim();

  if (!capability) {
    const error =
      new Error(
        "Mã QR Cing Wallet không hợp lệ."
      );

    error.code =
      "CING_WALLET_POS_CAPABILITY_REQUIRED";

    throw error;
  }

  return capability;
}


export async function
previewWalletPosPayment(
  capability
) {
  const normalized =
    normalizeCapability(
      capability
    );

  const response =
    await apiClient.get(
      `/wallet/pos-pay/${encodeURIComponent(
        normalized
      )}`
    );

  return (
    response.data?.data ||
    null
  );
}


export async function
confirmWalletPosPayment(
  capability
) {
  const normalized =
    normalizeCapability(
      capability
    );

  const response =
    await apiClient.post(
      `/wallet/pos-pay/${encodeURIComponent(
        normalized
      )}/confirm`
    );

  return (
    response.data?.data ||
    null
  );
}
