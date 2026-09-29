/*
 * CING_GAME_GIFT_PURCHASE_UI_AUTHORITY_V1
 *
 * Presentation and receipt validation only.
 * Financial authority remains in Railway + SQL.
 */

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const GIFT_ID =
  /^[a-z0-9][a-z0-9_-]{0,63}$/;

const MAX_POINTS =
  2147483647n;

const MAX_MESSAGE_CHARS =
  200;

export function normalizeGiftPhone(value) {
  const digits =
    String(value || "")
      .replace(/\D/g, "");

  if (
    digits.startsWith("84") &&
    digits.length === 11
  ) {
    return "0" + digits.slice(2);
  }

  return /^0[0-9]{9}$/.test(digits)
    ? digits
    : "";
}

export function normalizeGiftMessage(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error(
      "Lời nhắn không hợp lệ."
    );
  }

  const normalized =
    value.trim();

  if (!normalized) {
    return null;
  }

  if (
    Array.from(normalized).length >
      MAX_MESSAGE_CHARS
  ) {
    throw new Error(
      `Lời nhắn tối đa ${MAX_MESSAGE_CHARS} ký tự.`
    );
  }

  return normalized;
}

export function secureGiftRequestId() {
  const authority =
    globalThis.crypto;

  if (
    typeof authority?.randomUUID ===
    "function"
  ) {
    const id =
      authority.randomUUID();

    if (UUID.test(id)) {
      return id.toLowerCase();
    }
  }

  if (
    typeof authority?.getRandomValues !==
    "function"
  ) {
    throw new Error(
      "Trình duyệt chưa hỗ trợ tạo mã giao dịch an toàn."
    );
  }

  const bytes =
    new Uint8Array(16);

  authority.getRandomValues(bytes);

  bytes[6] =
    (bytes[6] & 0x0f) | 0x40;

  bytes[8] =
    (bytes[8] & 0x3f) | 0x80;

  const hex =
    Array.from(
      bytes,
      byte =>
        byte
          .toString(16)
          .padStart(2, "0")
    );

  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10).join(""),
  ].join("-");
}

function positiveInteger(value) {
  const raw =
    String(value ?? "");

  if (
    !/^[1-9][0-9]*$/.test(raw)
  ) {
    throw new Error(
      "Giá trị Gift không hợp lệ."
    );
  }

  return BigInt(raw);
}

export function validateGiftCatalog(data) {
  if (
    !Array.isArray(data) ||
    data.length > 100
  ) {
    throw new Error(
      "Danh mục Gift không hợp lệ."
    );
  }

  const seen =
    new Set();

  return data.map(row => {
    if (
      !row ||
      !GIFT_ID.test(row.id) ||
      typeof row.name !==
        "string" ||
      !row.name.trim() ||
      row.name.length > 120 ||
      typeof row.icon !==
        "string" ||
      !row.icon.trim() ||
      row.icon.length > 64 ||
      seen.has(row.id)
    ) {
      throw new Error(
        "Danh mục Gift không hợp lệ."
      );
    }

    const price =
      positiveInteger(
        row.price_vnd
      );

    const points =
      positiveInteger(
        row.points_cost
      );

    const charm =
      positiveInteger(
        row.charm_award
      );

    if (
      price < 1000n ||
      price % 1000n !== 0n ||
      price / 1000n !== points ||
      points > MAX_POINTS ||
      charm > MAX_POINTS
    ) {
      throw new Error(
        "Giá Gift hoặc điểm quy đổi không hợp lệ."
      );
    }

    seen.add(row.id);

    return {
      id: row.id,
      name: row.name.trim(),
      icon: row.icon.trim(),
      price_vnd:
        price.toString(),
      points_cost:
        points.toString(),
      charm_award:
        charm.toString(),
    };
  });
}

export function validateGiftReceipt(
  receipt,
  expected
) {
  if (
    !receipt ||
    receipt.applied !== true &&
      receipt.applied !== false ||
    !UUID.test(
      String(
        receipt.request_id || ""
      )
    ) ||
    String(
      receipt.request_id
    ).toLowerCase() !==
      expected.requestId ||
    receipt.sender_user_id !==
      expected.sender ||
    receipt.recipient_user_id !==
      expected.recipient ||
    receipt.gift_id !==
      expected.giftId ||
    receipt.funding_source !==
      expected.funding ||
    normalizeGiftMessage(
      receipt.sender_message
    ) !== expected.senderMessage
  ) {
    throw new Error(
      "Biên nhận Gift không khớp giao dịch."
    );
  }

  const price =
    positiveInteger(
      receipt.price_vnd
    );

  const charm =
    positiveInteger(
      receipt.charm_awarded
    );

  if (
    price < 1000n ||
    price % 1000n !== 0n ||
    price / 1000n > MAX_POINTS ||
    charm > MAX_POINTS ||
    !String(
      receipt.gift_name || ""
    ).trim() ||
    !String(
      receipt.gift_icon || ""
    ).trim()
  ) {
    throw new Error(
      "Biên nhận Gift không hợp lệ."
    );
  }

  if (
    expected.funding ===
    "points"
  ) {
    if (
      positiveInteger(
        receipt.points_cost
      ) !== price / 1000n ||
      ![
        "pending",
        "processing",
        "synced",
        "failed",
      ].includes(
        receipt.ipos_sync_status
      ) ||
      receipt.wallet_transaction_id !==
        null
    ) {
      throw new Error(
        "Biên nhận Gift bằng điểm không hợp lệ."
      );
    }
  } else if (
    !UUID.test(
      String(
        receipt.wallet_transaction_id ||
          ""
      )
    ) ||
    receipt.points_cost !== null ||
    receipt.ipos_sync_status !==
      "not_required"
  ) {
    throw new Error(
      "Biên nhận Gift bằng Wallet không hợp lệ."
    );
  }

  return receipt;
}

export function giftIntentKey(
  sender
) {
  const phone =
    normalizeGiftPhone(sender);

  if (!phone) {
    throw new Error(
      "Tài khoản Gift không hợp lệ."
    );
  }

  return (
    "cing_game_gift_purchase_v2_" +
    phone
  );
}

export function validateStoredGiftIntent(
  value,
  sender
) {
  if (
    !value ||
    value.sender !== sender ||
    !normalizeGiftPhone(
      value.recipient
    ) ||
    !GIFT_ID.test(
      value.giftId
    ) ||
    ![
      "wallet",
      "points",
    ].includes(
      value.funding
    ) ||
    !UUID.test(
      String(
        value.requestId || ""
      )
    )
  ) {
    return null;
  }

  return {
    sender,
    recipient: value.recipient,
    giftId: value.giftId,
    funding: value.funding,
    senderMessage:
      normalizeGiftMessage(
        value.senderMessage
      ),
    requestId:
      value.requestId.toLowerCase(),
  };
}
