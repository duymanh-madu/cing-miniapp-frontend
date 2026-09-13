import apiClient from "@/infra/api/apiClient";


function authConfig(
  token
) {
  return {
    headers: {
      Authorization:
        `Bearer ${token}`,
    },
  };
}


export async function
fetchWalletPosSessions(
  token,
  {
    status,
    limit = 30,
  } = {}
) {
  const query =
    new URLSearchParams();

  if (status) {
    query.set(
      "status",
      status
    );
  }

  query.set(
    "limit",
    String(limit)
  );

  const response =
    await apiClient.get(
      `/admin/wallet/pos/sessions?${query.toString()}`,
      authConfig(token)
    );

  return Array.isArray(
    response?.data?.data
  )
    ? response.data.data
    : [];
}


export async function
fetchWalletPosSession(
  token,
  sessionId
) {
  const response =
    await apiClient.get(
      `/admin/wallet/pos/sessions/${encodeURIComponent(
        sessionId
      )}`,
      authConfig(token)
    );

  return response?.data?.data ||
    null;
}


export async function
recoverWalletPosQr(
  token,
  sessionId
) {
  const response =
    await apiClient.get(
      `/admin/wallet/pos/sessions/${encodeURIComponent(
        sessionId
      )}/qr`,
      authConfig(token)
    );

  return response?.data?.data ||
    null;
}



export async function
submitWalletPosAmount(
  token,
  sessionId,
  amount
) {
  const response =
    await apiClient.post(
      `/admin/wallet/pos/sessions/${encodeURIComponent(
        sessionId
      )}/amount`,
      {
        amount,
      },
      authConfig(token)
    );

  return response?.data?.data ||
    null;
}


export async function
fetchWalletPosAlerts(
  token,
  {
    status = "open",
    limit = 100,
  } = {}
) {
  const query =
    new URLSearchParams({
      status:
        String(status),
      limit:
        String(limit),
    });

  const response =
    await apiClient.get(
      `/admin/wallet/pos/reconciliation-alerts?${query.toString()}`,
      authConfig(token)
    );

  return Array.isArray(
    response?.data?.data
  )
    ? response.data.data
    : [];
}
