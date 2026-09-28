"use strict";

const test =
  require("node:test");

const assert =
  require("node:assert/strict");

const fs =
  require("node:fs");

const path =
  require("node:path");

const root =
  path.resolve(
    __dirname,
    "../../../.."
  );

function read(relative) {
  return fs.readFileSync(
    path.join(
      root,
      relative
    ),
    "utf8"
  );
}

const component = read(
  "src/features/admin/components/AdminReviveCreditPrice.jsx"
);

const css = read(
  "src/features/admin/components/admin-revive-credit-price.css"
);

const games = read(
  "src/features/admin/components/AdminGames.jsx"
);

const gift = read(
  "src/features/admin/components/AdminGameGiftCatalog.jsx"
);

test(
  "mounted alongside existing Gift Catalog",
  () => {
    assert.match(
      games,
      /import AdminReviveCreditPrice from "\.\/AdminReviveCreditPrice"/
    );

    assert.match(
      games,
      /<AdminReviveCreditPrice token=\{token\} role=\{role\}/
    );

    assert.match(
      games,
      /<AdminGameGiftCatalog token=\{token\} role=\{role\}/
    );
  }
);

test(
  "Super Admin only",
  () => {
    assert.match(
      component,
      /role === "super_admin"/
    );

    assert.match(
      component,
      /if \(!isSuperAdmin\)/
    );
  }
);

test(
  "feature flag default OFF",
  () => {
    assert.match(
      component,
      /VITE_CING_REVIVE_ADMIN_PRICE_UI_ENABLED === "true"/
    );

    assert.match(
      component,
      /if \(!canUseApi\)/
    );
  }
);

test(
  "uses future backend API contract",
  () => {
    assert.match(
      component,
      /"\/admin\/game-economy\/revive"/
    );

    assert.match(
      component,
      /apiClient\.get/
    );

    assert.match(
      component,
      /apiClient\.put/
    );
  }
);

test(
  "VND points conversion uses BigInt",
  () => {
    assert.match(
      component,
      /BigInt\(text\)/
    );

    assert.match(
      component,
      /price % 1000n !== 0n/
    );

    assert.match(
      component,
      /price \/ 1000n/
    );
  }
);

test(
  "disable sends explicit NULL",
  () => {
    assert.match(
      component,
      /enabled\s*\?\s*priceVnd\.trim\(\)\s*:\s*null/
    );

    assert.match(
      component,
      /price_vnd:\s*configuredPrice/
    );
  }
);

test(
  "missing server price is not silently accepted",
  () => {
    assert.match(
      component,
      /normalizeRemote/
    );

    assert.match(
      component,
      /String\(data\.points_cost\) !==\s*price\.points/
    );
  }
);

test(
  "ambiguous retry preserves request ID",
  () => {
    assert.match(
      component,
      /pendingRequest \|\|\s*makeRequestId\(\)/
    );

    assert.match(
      component,
      /setPendingRequest\(\s*requestId/
    );
  }
);

test(
  "editing clears previous request identity",
  () => {
    const occurrences =
      component.match(
        /setPendingRequest\(null\)/g
      ) || [];

    assert.ok(
      occurrences.length >= 3
    );
  }
);

test(
  "does not mutate customer balances",
  () => {
    assert.doesNotMatch(
      component,
      /deductPoints|wallet_balance:|total_points:|charm_points:/
    );
  }
);

test(
  "existing Gift UI remains untouched",
  () => {
    assert.match(
      gift,
      /Gift Catalog/
    );

    assert.match(
      gift,
      /VITE_CING_GAME_GIFT_ADMIN_UI_ENABLED/
    );
  }
);

test(
  "mobile-first layout",
  () => {
    assert.match(
      css,
      /grid-template-columns/
    );

    assert.match(
      css,
      /@media \(max-width: 480px\)/
    );

    assert.match(
      css,
      /min-width: 0/
    );
  }
);
