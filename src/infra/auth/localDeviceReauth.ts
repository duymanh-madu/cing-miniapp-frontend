import apiClient from "@/infra/api/apiClient";

import {
  createSession,
} from "./authSession";

import {
  getCanonicalAccessToken,
} from "./persistedAuthSession";

const STORAGE_KEY =
  "cing_device_reauth_v1";

type DeviceReauthEnvelope = {
  version: 1;
  bindingId: string;
  credential: string;
  expiresAt: string;
};

function randomHex(
  byteLength: number
) {
  if (
    typeof crypto ===
      "undefined" ||
    typeof crypto.getRandomValues !==
      "function"
  ) {
    throw new Error(
      "Secure random generator unavailable."
    );
  }

  const bytes =
    new Uint8Array(
      byteLength
    );

  crypto.getRandomValues(
    bytes
  );

  return Array.from(bytes)
    .map(
      (value) =>
        value
          .toString(16)
          .padStart(2, "0")
    )
    .join("");
}

function normalizeEnvelope(
  value: any
): DeviceReauthEnvelope | null {
  if (
    !value ||
    typeof value !==
      "object" ||
    Number(value.version) !== 1
  ) {
    return null;
  }

  const bindingId =
    String(
      value.bindingId ||
      ""
    ).trim();

  if (
    !/^[0-9a-f]{64}$/.test(
      bindingId
    )
  ) {
    return null;
  }

  const credential =
    String(
      value.credential ||
      ""
    ).trim();

  if (
    credential &&
    !/^dr1\.[0-9a-f]{32}\.[A-Za-z0-9_-]{43}$/.test(
      credential
    )
  ) {
    return null;
  }

  const expiresAt =
    String(
      value.expiresAt ||
      ""
    ).trim();

  if (
    credential &&
    (
      !expiresAt ||
      !Number.isFinite(
        Date.parse(
          expiresAt
        )
      )
    )
  ) {
    return null;
  }

  return {
    version: 1,
    bindingId,
    credential,
    expiresAt,
  };
}

function readEnvelope():
DeviceReauthEnvelope | null {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) {
      return null;
    }

    return normalizeEnvelope(
      JSON.parse(raw)
    );
  } catch {
    return null;
  }
}

function persistEnvelope(
  envelope:
    DeviceReauthEnvelope
) {
  const normalized =
    normalizeEnvelope(
      envelope
    );

  if (!normalized) {
    return false;
  }

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        normalized
      )
    );

    const readBack =
      readEnvelope();

    return (
      readBack?.version === 1 &&
      readBack.bindingId ===
        normalized.bindingId &&
      readBack.credential ===
        normalized.credential &&
      readBack.expiresAt ===
        normalized.expiresAt
    );
  } catch {
    return false;
  }
}

function ensureBindingEnvelope():
DeviceReauthEnvelope | null {
  const existing =
    readEnvelope();

  if (
    existing?.bindingId
  ) {
    return existing;
  }

  try {
    const initial:
      DeviceReauthEnvelope = {
        version: 1,
        bindingId:
          randomHex(32),
        credential: "",
        expiresAt: "",
      };

    if (
      !persistEnvelope(
        initial
      )
    ) {
      return null;
    }

    return readEnvelope();
  } catch {
    return null;
  }
}

export function
clearLocalDeviceReauthCredential() {
  try {
    localStorage.removeItem(
      STORAGE_KEY
    );

    return (
      localStorage.getItem(
        STORAGE_KEY
      ) === null
    );
  } catch {
    return false;
  }
}

export async function
registerLocalDeviceReauthCredential(
  phoneToken: string,
  miniAccessToken: string
) {
  const verifiedPhoneToken =
    String(
      phoneToken ||
      ""
    ).trim();

  const verifiedMiniAccessToken =
    String(
      miniAccessToken ||
      ""
    ).trim();

  if (
    !verifiedPhoneToken ||
    !verifiedMiniAccessToken
  ) {
    return false;
  }

  const accessToken =
    String(
      getCanonicalAccessToken() ||
      ""
    ).trim();

  if (!accessToken) {
    return false;
  }

  const current =
    ensureBindingEnvelope();

  if (
    !current?.bindingId
  ) {
    return false;
  }

  try {
    const response =
      await apiClient.post(
        "/auth/device/register",
        {
          binding_id:
            current.bindingId,

          phone_token:
            verifiedPhoneToken,

          mini_access_token:
            verifiedMiniAccessToken,
        },
        {
          headers: {
            Authorization:
              `Bearer ${accessToken}`,
          },
        }
      );

    const payload =
      response?.data?.data ||
      response?.data ||
      {};

    const next =
      normalizeEnvelope({
        version: 1,

        bindingId:
          current.bindingId,

        credential:
          payload.credential,

        expiresAt:
          payload.expires_at,
      });

    if (
      !next?.credential
    ) {
      return false;
    }

    return persistEnvelope(
      next
    );
  } catch {
    return false;
  }
}

export async function
recoverLocalDeviceReauthSession() {
  const current =
    readEnvelope();

  if (
    !current?.bindingId ||
    !current.credential ||
    !current.expiresAt
  ) {
    return false;
  }

  if (
    Date.parse(
      current.expiresAt
    ) <= Date.now()
  ) {
    clearLocalDeviceReauthCredential();
    return false;
  }

  let response: any;

  try {
    response =
      await apiClient.post(
        "/auth/device/recover",
        {
          binding_id:
            current.bindingId,

          credential:
            current.credential,
        }
      );
  } catch (
    error: any
  ) {
    const status =
      Number(
        error?.response?.status ||
        0
      );

    if (
      status === 400 ||
      status === 401 ||
      status === 403
    ) {
      clearLocalDeviceReauthCredential();
    }

    return false;
  }

  const payload =
    response?.data?.data ||
    response?.data ||
    {};

  const accessToken =
    String(
      payload.accessToken ||
      payload.access_token ||
      ""
    ).trim();

  const refreshToken =
    String(
      payload.refreshToken ||
      payload.refresh_token ||
      ""
    ).trim();

  const successor =
    normalizeEnvelope({
      version: 1,

      bindingId:
        current.bindingId,

      credential:
        payload.credential,

      expiresAt:
        payload
          .credential_expires_at,
    });

  if (
    !accessToken ||
    !refreshToken ||
    !successor?.credential
  ) {
    clearLocalDeviceReauthCredential();
    return false;
  }

  /*
   * Backend has atomically consumed the previous
   * generation already.
   *
   * Successor persistence MUST succeed and read back
   * before JWT state becomes visible to the app.
   */
  const persisted =
    persistEnvelope(
      successor
    );

  if (!persisted) {
    clearLocalDeviceReauthCredential();
    return false;
  }

  const customer =
    payload.customer &&
    typeof payload.customer ===
      "object"
      ? payload.customer
      : {};

  createSession({
    accessToken,
    refreshToken,

    profile: {
      ...customer,

      id:
        customer.id ||
        customer.zalo_id ||
        "",

      name:
        customer.fullName ||
        customer.name ||
        "",

      phone:
        customer.phone ||
        "",

      avatar:
        customer.avatar ||
        "",
    },
  });

  return true;
}
