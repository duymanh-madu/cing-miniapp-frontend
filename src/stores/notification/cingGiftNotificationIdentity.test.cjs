"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "../../..");

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

const bridgeSource = fs.readFileSync(
  path.join(
    ROOT,
    "src/features/notification/components/NotificationSocketBridge.jsx"
  ),
  "utf8"
);

const gift = (id, purchaseId, read = false) => ({
  id,
  type: "gift_received",
  metadata: {
    source: "cing_game_gift_purchase_v1",
    gift_purchase_id: purchaseId,
  },
  read,
});

async function loadHelper() {
  const url =
    "data:text/javascript;base64," +
    Buffer.from(helperSource).toString("base64");

  return import(url);
}

test(
  "same Gift purchase deduplicates across HTTP and realtime",
  async () => {
    const {
      addGiftNotificationOnce,
    } = await loadHelper();

    const realtime = {
      ...gift(undefined, "purchase-1"),
      title: "Gift realtime",
    };

    const http = {
      ...gift(42, "purchase-1"),
      title: "Gift DB",
    };

    const first = addGiftNotificationOnce(
      [],
      realtime
    );

    const second = addGiftNotificationOnce(
      first.notifications,
      http
    );

    assert.equal(first.added, true);
    assert.equal(second.added, false);
    assert.equal(second.notifications.length, 1);
    assert.equal(second.notifications[0].id, 42);
  }
);

test(
  "duplicate Gift preserves locally read state",
  async () => {
    const {
      addGiftNotificationOnce,
    } = await loadHelper();

    const existing = [
      gift(42, "purchase-2", true),
    ];

    const result = addGiftNotificationOnce(
      existing,
      gift(42, "purchase-2", false)
    );

    assert.equal(result.added, false);
    assert.equal(result.notifications.length, 1);
    assert.equal(result.notifications[0].read, true);
  }
);

test(
  "different purchases are distinct Gifts",
  async () => {
    const {
      addGiftNotificationOnce,
    } = await loadHelper();

    const result = addGiftNotificationOnce(
      [gift(42, "purchase-1")],
      gift(43, "purchase-2")
    );

    assert.equal(result.added, true);
    assert.equal(result.notifications.length, 2);
  }
);

test(
  "legacy notifications retain normal insertion",
  async () => {
    const {
      addGiftNotificationOnce,
    } = await loadHelper();

    const legacy = {
      id: 5,
      type: "system",
      title: "Thông báo hệ thống",
    };

    const result = addGiftNotificationOnce(
      [legacy],
      legacy
    );

    assert.equal(result.added, true);
    assert.equal(result.notifications.length, 2);
  }
);

test(
  "database and local Gift merge deduplicates",
  async () => {
    const {
      deduplicateGiftNotifications,
    } = await loadHelper();

    const result = deduplicateGiftNotifications([
      gift(42, "purchase-1"),
      gift(undefined, "purchase-1"),
      gift(43, "purchase-2"),
    ]);

    assert.equal(result.length, 2);
  }
);

test(
  "both automatic mark-read paths exclude Economy V2 Gifts",
  () => {
    assert.match(
      storeSource,
      /\.filter\(n => !isCingGameGiftNotification\(n\)\)/
    );

    assert.match(
      bridgeSource,
      /\.filter\(n => !isCingGameGiftNotification\(n\)\)/
    );

    assert.match(
      storeSource,
      /ids: legacyReadIds/
    );

    assert.match(
      bridgeSource,
      /ids: legacyReadIds/
    );
  }
);

test(
  "Gift helper has no financial or network authority",
  () => {
    assert.doesNotMatch(
      helperSource,
      /\bfetch\(|\baxios\b|\.rpc\(|\.update\(/
    );

    assert.doesNotMatch(
      helperSource,
      /wallet_balance|loyalty_ledger|charm_balance/i
    );
  }
);
