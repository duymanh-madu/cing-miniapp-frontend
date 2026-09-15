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
    storeId = null,
  } = {}
) {
  const query =
    new URLSearchParams({
      status:
        String(status),
      limit:
        String(limit),
    });

  const normalizedStoreId =
    typeof storeId ===
      "string"
      ? storeId.trim()
      : "";

  if (
    normalizedStoreId
  ) {
    query.set(
      "store_id",
      normalizedStoreId
    );
  }

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


export async function
fetchCurrentWalletPosManualSession(
  token
) {
  const response =
    await apiClient.get(
      "/admin/wallet/pos/manual-session",
      authConfig(token)
    );

  return response?.data?.data ||
    null;
}


export async function
createWalletPosManualPayment(
  token,
  {
    amount,
    requestId,
  }
) {
  const response =
    await apiClient.post(
      "/admin/wallet/pos/manual-payment",
      {
        amount,
        request_id:
          requestId,
      },
      authConfig(token)
    );

  return response?.data?.data ||
    null;
}



export async function
cancelWalletPosManualSession(
  token,
  sessionId,
  {
    requestId,
    reason,
  }
) {
  const normalizedSessionId =
    String(
      sessionId || ""
    ).trim();

  if (!normalizedSessionId) {
    throw new Error(
      "Thiếu mã phiên Cing Pay."
    );
  }

  const response =
    await apiClient.post(
      `/admin/wallet/pos/manual-session/${encodeURIComponent(
        normalizedSessionId
      )}/cancel`,
      {
        request_id:
          requestId,
        reason,
      },
      {
        headers:
          authHeaders(
            token
          ),
      }
    );

  return response
    ?.data
    ?.data;
}


export async function
resolveWalletPosAlert(

  token,

  alertId,

  {

    requestId,

    resolutionAction,

    reasonCode,

    note = null,

  }

) {

  const payload = {

    request_id:

      requestId,

    resolution_action:

      resolutionAction,

    reason_code:

      reasonCode,

  };

  if (

    typeof note ===

      "string" &&

    note.trim()

  ) {

    payload.note =

      note.trim();

  }

  const response =

    await apiClient.post(

      `/admin/wallet/pos/reconciliation-alerts/${encodeURIComponent(

        alertId

      )}/resolve`,

      payload,

      authConfig(token)

    );

  return response?.data?.data ||

    null;

}
