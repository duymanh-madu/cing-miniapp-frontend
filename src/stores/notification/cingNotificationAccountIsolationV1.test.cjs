"use strict";

const test =
  require("node:test");

const assert =
  require("node:assert/strict");

const fs =
  require("node:fs");

const path =
  require("node:path");

const source =
  fs.readFileSync(
    path.join(
      __dirname,
      "notificationStore.js"
    ),
    "utf8"
  );

test(
  "storage key is scoped to authenticated account",
  () => {
    assert.match(
      source,
      /STORAGE_PREFIX \+ owner/
    );

    assert.match(
      source,
      /cached\?\.owner !== owner/
    );

    assert.doesNotMatch(
      source,
      /const STORAGE_KEY = "cing_notifs_v1"/
    );
  }
);

test(
  "identity transition clears visible notifications",
  () => {
    assert.match(
      source,
      /ownerGeneration \+= 1/
    );

    assert.match(
      source,
      /ownerPhone: owner,\s*notifications: \[\],\s*unread: 0,\s*loaded: false/
    );

    assert.match(
      source,
      /useRuntimeCustomerIdentityStore\.subscribe/
    );
  }
);

test(
  "stale storage and DB recovery cannot overwrite new account",
  () => {
    assert.match(
      source,
      /generation === ownerGeneration/
    );

    assert.match(
      source,
      /await loadFromStorage\(\s*owner\s*\)[\s\S]*?if \(!isCurrent\(\)\) return/
    );

    assert.match(
      source,
      /await loadFromDB\(\s*owner\s*\)[\s\S]*?if \(!isCurrent\(\)\) return/
    );
  }
);

test(
  "old delayed mark-read cannot start in a new account",
  () => {
    assert.match(
      source,
      /setTimeout\(\s*async \(\) => \{\s*if \(\s*!isCurrent\(\)/
    );
  }
);

test(
  "notification with explicit wrong recipient is rejected",
  () => {
    assert.match(
      source,
      /notificationOwner\(\s*recipient\s*\)\s*!== owner/
    );
  }
);

test(
  "Gift read and legacy behavior are retained",
  () => {
    assert.match(
      source,
      /addGiftNotificationOnce\(/
    );

    assert.match(
      source,
      /markGiftNotificationRead:/
    );

    assert.match(
      source,
      /markLegacyRead:/
    );

    assert.match(
      source,
      /deduplicateGiftNotifications\(/
    );
  }
);
