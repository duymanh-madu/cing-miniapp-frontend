"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(
  __dirname,
  "../../../.."
);

function read(relative) {
  return fs.readFileSync(
    path.join(ROOT, relative),
    "utf8"
  );
}

const panel = read(
  "src/features/notification/components/CingGiftInboxV2.jsx"
);

const bell = read(
  "src/features/notification/components/NotificationBellButton.jsx"
);

const store = read(
  "src/stores/notification/notificationStore.js"
);

test(
  "Gift Inbox consumes authenticated Economy V2 routes",
  () => {
    assert.match(
      panel,
      /apiClient\.get\(\s*BASE/
    );

    assert.match(
      panel,
      /apiClient\.post\(/
    );

    assert.match(
      panel,
      /\/game\/economy-v2\/gifts\/notifications/
    );

    assert.doesNotMatch(
      panel,
      /profile-update\/notifications/
    );
  }
);

test(
  "Gift Inbox remains frontend default OFF",
  () => {
    assert.match(
      bell,
      /VITE_CING_GAME_GIFT_INBOX_V2_ENABLED\s*===\s*"true"/
    );

    assert.match(
      bell,
      /<CingGiftInboxV2 phone=\{phone\}/
    );
  }
);

test(
  "Bell opening does not auto-read V2 Gift",
  () => {
    assert.match(
      bell,
      /if \(!open\) markLegacyRead\(\)/
    );

    assert.match(
      store,
      /markLegacyRead:/
    );

    assert.match(
      store,
      /isCingGameGiftNotification\(notification\)/
    );
  }
);

test(
  "Gift read requires backend confirmation",
  () => {
    assert.match(
      panel,
      /response\.data\?\.success !== true/
    );

    assert.match(
      panel,
      /response\.data\?\.data\?\.is_read !== true/
    );

    assert.match(
      panel,
      /markGiftNotificationRead\(\{/
    );

    assert.match(
      store,
      /markGiftNotificationRead:/
    );
  }
);

test(
  "Gift list filters canonical Gift purchase source",
  () => {
    assert.match(
      panel,
      /\.filter\(\s*isCingGameGiftNotification/
    );

    assert.match(
      panel,
      /deduplicateGiftNotifications/
    );
  }
);

test(
  "Gift Inbox contains no financial authority",
  () => {
    assert.doesNotMatch(
      panel,
      /\.rpc\(|wallet_balance|loyalty_ledger|charm_balance/i
    );

    assert.doesNotMatch(
      panel,
      /purchaseGameGift|buyReviveCreditsWithPoints/
    );
  }
);

test(
  "Gift Inbox contains recovery and error UI",
  () => {
    assert.match(
      panel,
      /Đang tải quà tặng/
    );

    assert.match(
      panel,
      /Làm mới/
    );

    assert.match(
      panel,
      /Chưa tải được quà tặng/
    );

    assert.match(
      panel,
      /Chạm để đánh dấu đã xem/
    );
  }
);
