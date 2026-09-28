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
  "CING_NOTIFICATION_SOCKET_LIFECYCLE_V1"
);

const end = source.indexOf(
  "return popup ? createPortal(",
  start
);

assert.ok(start >= 0);
assert.ok(end > start);

const effect = source.slice(start, end);

test("listeners are removed by owned references", () => {
  for (const [event, handler] of [
    ["notification.new", "handler"],
    ["notification.broadcast", "handler"],
    ["notification:new", "chessHandler"],
    ["connect", "reconnectHandler"],
  ]) {
    assert.ok(
      effect.includes(
        `socket.off("${event}", ${handler})`
      )
    );
  }

  assert.doesNotMatch(
    effect,
    /socket\.off\("notification:new"\)/
  );
});

test("reconnect detaches before reattaching", () => {
  assert.match(
    effect,
    /const reconnectHandler = \(\) => \{[\s\S]*?detachOwnedListeners\(\);[\s\S]*?attach\(\);/
  );
});

test("generic callback has account session fence", () => {
  assert.match(
    effect,
    /receivedSession === sessionVersion/
  );

  assert.match(
    effect,
    /store\.getState\(\)\.ownerPhone !== owner/
  );
});

test("Chess callback has account session fence", () => {
  assert.match(
    effect,
    /receivedSession !== sessionVersion/
  );

  assert.match(
    effect,
    /store\.getState\(\)\.ownerPhone !== recipient/
  );

  assert.match(
    effect,
    /data\?\.type !== "gift_received"/
  );
});

test("popup is invalidated on account change", () => {
  assert.match(
    effect,
    /sessionVersion \+= 1;[\s\S]*?clearPopupTimer\(\);[\s\S]*?setPopup\(null\)/
  );
});

test("all effect resources have cleanup", () => {
  assert.match(
    effect,
    /return \(\) => \{[\s\S]*?active = false;[\s\S]*?clearTimeout\(retryTimer\);[\s\S]*?clearPopupTimer\(\);[\s\S]*?detachOwnedListeners\(\);[\s\S]*?unsubscribeIdentity\(\)/
  );
});

test("HTTP recovery fence survives", () => {
  assert.match(
    source,
    /CING_NOTIFICATION_BRIDGE_ACCOUNT_FENCE_V1/
  );

  assert.match(
    source,
    /CING_CHESS_LEGACY_GIFT_ACCOUNT_FENCE_V1/
  );
});
