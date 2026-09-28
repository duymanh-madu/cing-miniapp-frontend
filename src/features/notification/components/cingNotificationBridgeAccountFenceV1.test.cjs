"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(
  path.join(__dirname, "NotificationSocketBridge.jsx"),
  "utf8"
);

const start = source.indexOf(
  "CING_NOTIFICATION_BRIDGE_ACCOUNT_FENCE_V1"
);

const end = source.indexOf(
  "let attempts = 0;",
  start
);

assert.ok(start >= 0);
assert.ok(end > start);

const recovery = source.slice(start, end);

test(
  "HTTP recovery uses current runtime identity",
  () => {
    assert.match(
      recovery,
      /useRuntimeCustomerIdentityStore\s*\.getState\(\)/
    );

    assert.match(
      recovery,
      /active && currentPhone\(\) === p/
    );
  }
);

test(
  "late dynamic import is fenced",
  () => {
    assert.match(
      recovery,
      /await import\([\s\S]*?notificationStore[\s\S]*?\);[\s\S]*?if \(!isCurrent\(\)\) return/
    );
  }
);

test(
  "recovered notification carries account owner",
  () => {
    assert.match(
      recovery,
      /user_id: p/
    );
  }
);

test(
  "automatic legacy read excludes Gift V2",
  () => {
    assert.match(
      recovery,
      /\.filter\(n => !isCingGameGiftNotification\(n\)\)/
    );

    assert.match(
      recovery,
      /ids: legacyReadIds/
    );
  }
);

test(
  "cleanup invalidates callback and timer",
  () => {
    assert.match(recovery, /active = false/);
    assert.match(
      recovery,
      /clearTimeout\(readTimer\)/
    );
  }
);
