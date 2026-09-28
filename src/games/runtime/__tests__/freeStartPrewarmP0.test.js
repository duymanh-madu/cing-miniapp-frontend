import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source =
  fs.readFileSync(
    new URL(
      "../../../features/game-center/components/CingOfflineRevivalGameV2.jsx",
      import.meta.url
    ),
    "utf8"
  );

test(
  "free games prewarm session when game surface mounts",
  () => {
    assert.match(
      source,
      /CING FREE START PREWARM/
    );

    assert.match(
      source,
      /void start\(\)/
    );
  }
);

test(
  "existing prewarmed session authorizes Start immediately",
  () => {
    assert.match(
      source,
      /if \(sessionRef\.current\) \{\s*return true;\s*\}/
    );
  }
);

test(
  "revive and finalize remain backend-authoritative",
  () => {
    assert.match(
      source,
      /purchaseOfflineRevival/
    );

    assert.match(
      source,
      /finalizeOfflineRevivalSession/
    );
  }
);
