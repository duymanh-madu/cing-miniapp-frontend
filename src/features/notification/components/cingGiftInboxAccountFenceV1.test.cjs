"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(
  path.join(
    __dirname,
    "CingGiftInboxV2.jsx"
  ),
  "utf8"
);

const start = source.indexOf(
  "CING_GIFT_INBOX_ACCOUNT_FENCE_V1"
);

const end = source.indexOf(
  "<section style={panelStyle}>",
  start
);

assert.ok(start >= 0);
assert.ok(end > start);

const logic = source.slice(start, end);

test(
  "identity changes invalidate previous Gift session",
  () => {
    assert.match(
      logic,
      /useRuntimeCustomerIdentityStore\.subscribe/
    );

    assert.match(
      logic,
      /epochRef\.current \+= 1/
    );

    assert.match(
      logic,
      /session\.epoch === epochRef\.current/
    );
  }
);

test(
  "session checks runtime phone, prop and Store owner",
  () => {
    assert.match(
      logic,
      /session\.owner === runtimePhone\(\)/
    );

    assert.match(
      logic,
      /session\.owner === normalizePhone\(phone\)/
    );

    assert.match(
      logic,
      /ownerPhone === session\.owner/
    );
  }
);

test(
  "refresh cannot overwrite a newer Gift list request",
  () => {
    assert.match(
      logic,
      /requestId === listRequestRef\.current/
    );

    assert.match(
      logic,
      /await apiClient\.get\(\s*BASE/
    );

    assert.match(
      logic,
      /if \(!isCurrent\(\)\) return/
    );
  }
);

test(
  "Gift list accepts only canonical source and owner",
  () => {
    assert.match(
      logic,
      /response\.data\.data\.filter\(\s*isCingGameGiftNotification/
    );

    assert.match(
      logic,
      /normalizePhone\(\s*gift\.user_id\s*\) === session\.owner/
    );

    assert.match(
      logic,
      /user_id: session\.owner/
    );
  }
);

test(
  "read confirmation cannot update the next account",
  () => {
    assert.match(
      logic,
      /await apiClient\.post\(/
    );

    assert.match(
      logic,
      /if \(!isCurrentSession\(session\)\) \{\s*return;\s*\}/
    );

    assert.match(
      logic,
      /response\.data\?\.data\?\.is_read !== true/
    );

    assert.match(
      logic,
      /markGiftNotificationRead\(\{/
    );
  }
);

test(
  "unmount invalidates outstanding async work",
  () => {
    assert.match(
      logic,
      /mountedRef\.current = false/
    );

    assert.match(
      logic,
      /epochRef\.current \+= 1/
    );

    assert.match(
      logic,
      /unsubscribe\(\)/
    );
  }
);

test(
  "Gift Inbox retains recovery and mark-read UI",
  () => {
    assert.match(
      source,
      /onClick=\{\(\) => load\(\)\}/
    );

    assert.match(
      source,
      /Đang tải quà tặng/
    );

    assert.match(
      source,
      /Chưa tải được quà tặng/
    );

    assert.match(
      source,
      /Chạm để đánh dấu đã xem/
    );
  }
);
