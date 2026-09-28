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
  "CING_CHESS_LEGACY_GIFT_ACCOUNT_FENCE_V1"
);

const end = source.indexOf(
  'socket.on("connect",',
  start
);

assert.ok(start >= 0);
assert.ok(end > start);

const handler = source.slice(start, end);

test("Chess Gift requires an explicit recipient", () => {
  assert.match(
    handler,
    /normalizePhone\(data\?\.userId\)/
  );

  assert.match(
    handler,
    /!recipient \|\|/
  );
});

test("Chess Gift requires an explicit type", () => {
  assert.match(
    handler,
    /data\?\.type !== "gift_received"/
  );

  assert.doesNotMatch(
    handler,
    /data\.type \|\| "gift_received"/
  );
});

test("late import rechecks current account", () => {
  assert.match(
    handler,
    /recipient !== currentPhone\(\) \|\|[\s\S]*?ownerPhone !== recipient/
  );
});

test("legacy Gift carries recipient into Store", () => {
  assert.match(
    handler,
    /user_id: recipient/
  );

  assert.match(
    handler,
    /type: "gift_received"/
  );
});

test("existing HTTP and generic events retained", () => {
  assert.match(
    source,
    /CING_NOTIFICATION_BRIDGE_ACCOUNT_FENCE_V1/
  );

  assert.match(
    source,
    /socket\.on\("notification\.new", handler\)/
  );

  assert.match(
    source,
    /socket\.on\("notification\.broadcast", handler\)/
  );
});
