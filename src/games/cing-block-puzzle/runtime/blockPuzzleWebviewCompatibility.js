function fail(
  code,
  message
) {
  const error =
    new Error(message);

  error.code = code;

  throw error;
}

/*
 * Block Puzzle replay/session recovery data is deliberately
 * JSON-serializable. Recovery already persists this domain
 * through JSON.stringify/JSON.parse.
 *
 * structuredClone is preferred when the WebView provides it,
 * while the JSON path preserves compatibility with older
 * Android/Zalo WebViews without changing replay semantics.
 */
export function
cloneBlockPuzzleSerializableValue(
  value
) {
  if (
    typeof globalThis
      .structuredClone ===
    "function"
  ) {
    return globalThis
      .structuredClone(value);
  }

  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(
    JSON.stringify(value)
  );
}

/*
 * request_id remains a cryptographically generated UUID v4.
 *
 * Modern WebViews use crypto.randomUUID().
 * Older secure-context WebViews can use crypto.getRandomValues().
 * Math.random is intentionally forbidden because request_id is an
 * idempotency authority for session/continue mutations.
 */
export function
createBlockPuzzleSecureUuidV4() {
  const cryptoAuthority =
    globalThis.crypto;

  if (
    typeof cryptoAuthority
      ?.randomUUID ===
    "function"
  ) {
    return cryptoAuthority
      .randomUUID();
  }

  if (
    typeof cryptoAuthority
      ?.getRandomValues !==
    "function"
  ) {
    fail(
      "BLOCK_PUZZLE_REQUEST_ID_UNAVAILABLE",
      "Không thể tạo request_id an toàn"
    );
  }

  const bytes =
    new Uint8Array(16);

  cryptoAuthority
    .getRandomValues(bytes);

  /*
   * RFC 4122 UUID v4:
   * version = 0100
   * variant = 10xx
   */
  bytes[6] =
    (bytes[6] & 0x0f) |
    0x40;

  bytes[8] =
    (bytes[8] & 0x3f) |
    0x80;

  const hex =
    Array.from(
      bytes,
      (byte) =>
        byte
          .toString(16)
          .padStart(2, "0")
    );

  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
}
