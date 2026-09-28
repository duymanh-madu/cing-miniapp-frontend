/*
 * CING GAME CENTER V2
 * Durable Revive Credit purchase identity.
 *
 * No HTTP, Wallet debit, loyalty deduction,
 * price calculation or local balance mutation.
 */

const STORAGE_KEY =
  "cing:revive-credit:purchase-intent:v1";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SOURCES =
  new Set(["wallet", "points"]);

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

function ownerOf(value) {
  const userId =
    typeof value === "string"
      ? value.trim()
      : "";

  if (!/^0[0-9]{9}$/.test(userId)) {
    fail("REVIVE_CREDIT_PURCHASE_OWNER_REQUIRED");
  }

  return userId;
}

function sourceOf(value) {
  if (!SOURCES.has(value)) {
    fail("REVIVE_CREDIT_PURCHASE_SOURCE_INVALID");
  }

  return value;
}

function quantityOf(value) {
  if (
    !Number.isSafeInteger(value) ||
    value < 1 ||
    value > 2147483647
  ) {
    fail("REVIVE_CREDIT_PURCHASE_QUANTITY_INVALID");
  }

  return value;
}

function requestOf(value) {
  if (
    typeof value !== "string" ||
    !UUID.test(value)
  ) {
    fail("REVIVE_CREDIT_PURCHASE_REQUEST_INVALID");
  }

  return value.toLowerCase();
}

function storageOf(storage) {
  if (
    !storage ||
    typeof storage.getItem !== "function" ||
    typeof storage.setItem !== "function" ||
    typeof storage.removeItem !== "function"
  ) {
    fail("REVIVE_CREDIT_PURCHASE_STORAGE_REQUIRED");
  }

  return storage;
}

function readRaw(storage) {
  try {
    return storage.getItem(STORAGE_KEY);
  } catch {
    fail("REVIVE_CREDIT_PURCHASE_STORAGE_UNAVAILABLE");
  }
}

function parseIntent(raw) {
  if (raw === null) return null;

  let data;

  try {
    data = JSON.parse(raw);
  } catch {
    fail("REVIVE_CREDIT_PURCHASE_INTENT_CORRUPTED");
  }

  if (
    !data ||
    Array.isArray(data) ||
    data.version !== 1 ||
    !/^0[0-9]{9}$/.test(data.user_id) ||
    !SOURCES.has(data.funding_source) ||
    !Number.isSafeInteger(data.quantity) ||
    data.quantity < 1 ||
    data.quantity > 2147483647 ||
    typeof data.request_id !== "string" ||
    !UUID.test(data.request_id)
  ) {
    fail("REVIVE_CREDIT_PURCHASE_INTENT_CORRUPTED");
  }

  return Object.freeze({
    version: 1,
    user_id: data.user_id,
    funding_source: data.funding_source,
    quantity: data.quantity,
    request_id: data.request_id.toLowerCase(),
  });
}

export function readReviveCreditPurchaseIntent({
  storage,
  userId,
}) {
  const target = storageOf(storage);
  const owner = ownerOf(userId);
  const intent = parseIntent(readRaw(target));

  if (
    intent &&
    intent.user_id !== owner
  ) {
    fail("REVIVE_CREDIT_PURCHASE_OTHER_MEMBER");
  }

  return intent;
}

export function ensureReviveCreditPurchaseIntent({
  storage,
  userId,
  fundingSource,
  quantity,
  createRequestId,
}) {
  const target = storageOf(storage);
  const owner = ownerOf(userId);
  const source = sourceOf(fundingSource);
  const count = quantityOf(quantity);

  const existing =
    readReviveCreditPurchaseIntent({
      storage: target,
      userId: owner,
    });

  if (existing) {
    if (
      existing.funding_source !== source ||
      existing.quantity !== count
    ) {
      fail("REVIVE_CREDIT_PURCHASE_UNRESOLVED");
    }

    return existing;
  }

  if (typeof createRequestId !== "function") {
    fail("REVIVE_CREDIT_PURCHASE_UUID_REQUIRED");
  }

  const intent = Object.freeze({
    version: 1,
    user_id: owner,
    funding_source: source,
    quantity: count,
    request_id:
      requestOf(createRequestId()),
  });

  const serialized =
    JSON.stringify(intent);

  try {
    target.setItem(
      STORAGE_KEY,
      serialized
    );

    if (
      target.getItem(STORAGE_KEY) !==
      serialized
    ) {
      throw new Error("Persistence mismatch");
    }
  } catch {
    fail("REVIVE_CREDIT_PURCHASE_STORAGE_UNAVAILABLE");
  }

  return intent;
}

export function clearReviveCreditPurchaseIntent({
  storage,
  userId,
  requestId,
}) {
  const target = storageOf(storage);
  const owner = ownerOf(userId);
  const request = requestOf(requestId);

  const existing =
    readReviveCreditPurchaseIntent({
      storage: target,
      userId: owner,
    });

  if (!existing) {
    return false;
  }

  if (
    existing.request_id !== request
  ) {
    fail("REVIVE_CREDIT_PURCHASE_CLEAR_MISMATCH");
  }

  try {
    target.removeItem(STORAGE_KEY);

    if (
      target.getItem(STORAGE_KEY) !==
      null
    ) {
      throw new Error("Removal mismatch");
    }
  } catch {
    fail("REVIVE_CREDIT_PURCHASE_STORAGE_UNAVAILABLE");
  }

  return true;
}

export const REVIVE_CREDIT_PURCHASE_INTENT_KEY =
  STORAGE_KEY;
