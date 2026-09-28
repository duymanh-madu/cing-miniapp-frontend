"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(
  __dirname,
  "../../.."
);

const helperSource = fs.readFileSync(
  path.join(
    ROOT,
    "src/stores/notification/cingGiftNotificationIdentity.js"
  ),
  "utf8"
);

const storeSource = fs.readFileSync(
  path.join(
    ROOT,
    "src/stores/notification/notificationStore.js"
  ),
  "utf8"
);

const gift = (
  id,
  purchaseId,
  {
    read = false,
    is_read = false,
  } = {}
) => ({
  id,
  type: "gift_received",
  metadata: {
    source: "cing_game_gift_purchase_v1",
    gift_purchase_id: purchaseId,
  },
  read,
  is_read,
});

async function loadHelper() {
  const url =
    "data:text/javascript;base64," +
    Buffer.from(helperSource).toString("base64");

  return import(url);
}

test(
  "backend read state is retained by frontend store",
  () => {
    assert.match(
      storeSource,
      /read: isCingGameGiftNotification\(notif\)\s*\?\s*Boolean\(notif\.is_read \|\| notif\.read\)/
    );
  }
);

test(
  "realtime replay cannot make a read Gift unread",
  async () => {
    const {
      addGiftNotificationOnce,
    } = await loadHelper();

    const result = addGiftNotificationOnce(
      [
        gift(42, "purchase-1", {
          read: true,
          is_read: true,
        }),
      ],
      gift(42, "purchase-1")
    );

    assert.equal(result.added, false);
    assert.equal(result.notifications.length, 1);
    assert.equal(result.notifications[0].read, true);
    assert.equal(result.notifications[0].is_read, true);
  }
);

test(
  "backend read state survives duplicate HTTP merge",
  async () => {
    const {
      deduplicateGiftNotifications,
    } = await loadHelper();

    const result = deduplicateGiftNotifications([
      gift(42, "purchase-1", {
        is_read: false,
      }),
      gift(42, "purchase-1", {
        is_read: true,
      }),
    ]);

    assert.equal(result.length, 1);
    assert.equal(result[0].read, true);
    assert.equal(result[0].is_read, true);
  }
);

test(
  "local confirmed read survives stale HTTP state",
  async () => {
    const {
      deduplicateGiftNotifications,
    } = await loadHelper();

    const result = deduplicateGiftNotifications([
      gift(42, "purchase-2"),
      gift(42, "purchase-2", {
        read: true,
      }),
    ]);

    assert.equal(result.length, 1);
    assert.equal(result[0].read, true);
  }
);

test(
  "different Gift purchases remain separate",
  async () => {
    const {
      deduplicateGiftNotifications,
    } = await loadHelper();

    const result = deduplicateGiftNotifications([
      gift(42, "purchase-1"),
      gift(43, "purchase-2"),
    ]);

    assert.equal(result.length, 2);
  }
);

test(
  "legacy notifications are not deduplicated",
  async () => {
    const {
      deduplicateGiftNotifications,
    } = await loadHelper();

    const notification = {
      id: 5,
      type: "system",
      read: false,
    };

    const result = deduplicateGiftNotifications([
      notification,
      notification,
    ]);

    assert.equal(result.length, 2);
  }
);

test(
  "read-state helper remains financial-authority free",
  () => {
    assert.doesNotMatch(
      helperSource,
      /\bfetch\(|\baxios\b|\.rpc\(|wallet_balance|loyalty_ledger|charm_balance/i
    );
  }
);
